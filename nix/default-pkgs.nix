{ pkgs }:
with pkgs; [
  air
  boltbrowser
  eslint
  gnumake
  go
  go-tools
  gopls
  govulncheck
  nodejs
  nodePackages.prettier
  typescript
]
