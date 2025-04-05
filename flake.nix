{
  description = "go-signs";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      # Define the systems we want to support
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      # Helper function to generate packages for each system
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in {
      # Create dev shells for each supported system
      devShells = forAllSystems (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in {
          default = pkgs.mkShell {
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
        }
      );
    };
}
