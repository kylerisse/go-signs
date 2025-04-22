{ pkgs }:
with pkgs; [
  air
  boltbrowser
  eslint
  gcc
  gnumake
  go
  go-tools
  gopls
  govulncheck
  nodejs
  nodePackages.prettier
  prefetch-npm-deps
  typescript
]
