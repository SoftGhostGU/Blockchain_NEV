/*
 * SPDX-License-Identifier: 
 */

package main

import (
	"testing"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-chaincode-go/shimtest"
)

func TestInit(t *testing.T) {
	cc := new(Chaincode)
	stub := shimtest.NewMockStub("chaincode", cc)
	res := stub.MockInit("1", [][]byte{[]byte("initFunc")})
	if res.Status != shim.OK {
		t.Error("Init failed", res.Status, res.Message)
	}
}

func TestInvoke(t *testing.T) {
	cc := new(Chaincode)
	stub := shimtest.NewMockStub("chaincode", cc)
	res := stub.MockInit("1", [][]byte{[]byte("initFunc")})
	if res.Status != shim.OK {
		t.Error("Init failed", res.Status, res.Message)
	}
	res = stub.MockInvoke("1", [][]byte{[]byte("invokeFunc")})
	if res.Status != shim.OK {
		t.Error("Invoke failed", res.Status, res.Message)
	}
}
