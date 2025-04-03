{
  description = "go-signs";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      pkgs = nixpkgs.legacyPackages.x86_64-linux.pkgs;
    in
    {
      devShells."x86_64-linux".default = pkgs.mkShell {
        buildInputs = with pkgs; [
          air
          eslint
          gnumake
          go
          go-tools
          gopls
          govulncheck
          nodejs
          typescript
        ];
      };
    };
}
