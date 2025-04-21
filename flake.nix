{
  description = "go-signs";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = inputs: {
    devShells = import ./nix/dev-shells.nix { inherit inputs; };
  };
}
