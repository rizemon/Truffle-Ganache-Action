# Truffle-Ganache-Action


## If testing locally (using act),

1) Start `ganache` on port `127.0.0.1:8545`. (Needs to be done everytime you test a `job` locally as `act` does not automatically startup the `ganache` service.)
2) Run the intended workflow: e.g `act -j blockchain-ci`