#!/usr/bin/env bash

cd test-network

function cleanup() {
    ./network.sh down && rm -rf ../../../backend/crypto-config/*
}

function start() {
    cleanup
    ./network.sh up createChannel -c mychannel && \
    ./network.sh deployCC -ccn financialsLedger -ccp ../../blockchain-financials/ -ccl typescript && \
    ./network.sh deployCC -ccn ordersLedger -ccp ../../blockchain-orders/ -ccl typescript
    cp -r ./organizations/peerOrganizations ../../../backend/crypto-config/
}

case "$1" in
    "cleanup")
        cleanup
        ;;
    "start")
        start
        ;;
    *)
        echo "Usage: $0 {start|cleanup}"
        echo "  start   - Start the network and deploy chaincodes"
        echo "  cleanup - Stop the network and clean up crypto config"
        exit 1
        ;;
esac
