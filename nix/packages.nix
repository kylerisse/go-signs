{ inputs }:

let
  systems = [
    "x86_64-linux"
    "aarch64-linux"
    "aarch64-darwin"
  ];
in
inputs.nixpkgs.lib.genAttrs systems
  (
    system:
    let
      pkgs = inputs.nixpkgs.legacyPackages.${system};
      lib = pkgs.lib;
      defaultPackages = import ./default-pkgs.nix { inherit pkgs; };

      # prefetch-npm-deps react-display/package-lock.json
      npmDeps = pkgs.fetchNpmDeps {
        src = builtins.path { path = ../react-display; };
        hash = "sha256-FLPr0AbSyPDtl4CLJus4l9wCmXEQlCHLStuTw5K1hFI=";
      };

      targets = [
        "linux/amd64"
        "linux/arm64"
        "darwin/arm64"
      ];

    in
    {
      go-signs-ci-release = pkgs.buildGoModule rec {
        pname = "go-signs-ci";
        version = "release";
        src = builtins.path { path = ../.; };
        goPackagePath = "github.com/kylerisse/go-signs";

        vendorHash = "sha256-mrHfOS9EoM8o9RXQBYVLGFR+uGITI3v/aRAKBq3/wc0=";

        nativeBuildInputs = defaultPackages ++ [ npmDeps ];

        # run both lint/tests and the React build before the go build
        checkPhase = ''
          # point npm at the offline cache
          export npm_config_cache=${npmDeps}

          # React lint
          cd react-display
          npm ci --cache="$npm_config_cache" --prefer-offline --no-audit --progress=false
          node node_modules/.bin/eslint . --max-warnings=0
          cd ..

          # Go tests
          export CGO_ENABLED=1
          export XDG_CACHE_HOME=$TMPDIR
          mkdir -p $XDG_CACHE_HOME/staticcheck
          staticcheck ./...
          go test -count=1 --race -v ./...
        '';

        # custom buildPhase: React → cross‑compile Go
        buildPhase = ''
          # point npm at the offline cache
          export npm_config_cache=${npmDeps}

          # build the React bundle
          cd react-display
          npm ci --cache="$npm_config_cache" --prefer-offline --no-audit --progress=false

          # invoke tsc & vite via node
          node node_modules/.bin/tsc -b
          node node_modules/.bin/vite build
          cd ..

          # cross‑compile every GOOS/GOARCH
          export CGO_ENABLED=0
          mkdir -p out
          for triple in ${lib.concatStringsSep " " targets}; do
            IFS="/" read goos goarch <<< "$triple"
            echo "→ building go-signs for $goos/$goarch"
            GOOS=$goos GOARCH=$goarch go build \
              -o out/go-signs-$goos-$goarch \
              cmd/go-signs/main.go

            echo "→ building scale-simulator for $goos/$goarch"
            GOOS=$goos GOARCH=$goarch go build \
              -o out/scale-simulator-$goos-$goarch \
              cmd/scale-simulator/main.go
          done
        '';

        installPhase = ''
          # copy all cross-compiled versions
          mkdir -p $out/bin
          for f in out/*; do
            cp "$f" $out/
          done
          cd $out && sha256sum go-signs-* scale-simulator-* > $out/checksums.txt
        '';

        meta = with lib; {
          description = "go-signs CI release";
          license = licenses.mit;
          maintainers = [ "kylerisse" ];
        };
      };
    }
  )
