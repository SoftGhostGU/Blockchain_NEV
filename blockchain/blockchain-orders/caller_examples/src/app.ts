/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, hash, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'ordercontract');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'fabric-example', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));

// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));

// Path to user certificate directory.
const certDirectoryPath = envOrDefault('CERT_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
// const orderId = `order${String(Date.now())}`;
const financialID = `${String(Date.now() + 5)}`;
const carOwnerID = `${String(Date.now())}`;


async function main(): Promise<void> {
    displayInputParameters();

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        hash: hash.sha256,
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);

        // Initialize a set of order data on the ledger using the chaincode 'InitLedger' function.
        await initLedger(contract);

        // Return all the current orders on the ledger.
        await getAllOrders(contract);

        // Create a new order on the ledger.
        await createOrder(contract);

        // Update an existing order asynchronously.
        await transferOrderAsync(contract);

        // Get the order details by orderID.
        await readOrderByID(contract);

        // Update an order which exists.
        await updateOrder(contract)
    } finally {
        gateway.close();
        client.close();
    }
}

main().catch((error: unknown) => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(): Promise<Identity> {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function getFirstDirFileName(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

async function newSigner(): Promise<Signer> {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of orders on the ledger');

    await contract.submitTransaction('InitLedger');

    console.log('*** Transaction committed successfully');
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getAllOrders(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetAllOrders, function returns all the current orders on the ledger');

    const resultBytes = await contract.evaluateTransaction('QueryAllOrders');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result: unknown = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createOrder(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: CreateOrder, creates new order with ID, Color, Size, Owner and AppraisedValue arguments');

    const orderID = 'ORD20250717001';
    const userID = '1';
    const ownerID = '2';
    const startLocation = 'Tokyo Station';
    const endLocation = 'Shibuya';
    const startTime = new Date().toISOString(); 
    const miles = '12.5';
    const orderStatus = 'pending';
    const orderType = 'standard';
    const cost = '3000';
    const rate = '4.8';
    const comment = 'Fast pickup';

    try {
        await contract.submitTransaction(
            'CreateOrder',
            orderID,
            userID,
            ownerID,
            startLocation,
            endLocation,
            startTime,
            miles,
            orderStatus,
            orderType,
            cost,
            rate,
            comment
        );
        console.log(`✅ Order ${orderID} created successfully`);
    } catch (error) {
        console.error(`❌ Failed to create order: ${error}`);
    }
}

/**
 * Submit transaction asynchronously, allowing the application to process the smart contract response (e.g. update a UI)
 * while waiting for the commit notification.
 */
async function transferOrderAsync(contract: Contract): Promise<void> {
    console.log('\n--> Async Submit Transaction: TransferOrder, updates existing order owner');

    const orderID = 'ORD20250717001'; // 请确保这是存在于链上的订单ID
    const newOwnerID = '3';             // 新的接单人

    try {
        const commit = await contract.submitAsync('TransferOrder', {
            arguments: [orderID, newOwnerID],
        });
        console.log(`*** Successfully submitted TransferOrder transaction for orderID ${orderID}`);
        console.log('*** Waiting for transaction commit...');

        const status = await commit.getStatus();
        if (!status.successful) {
            throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
        }

        console.log(`✅ Transaction ${status.transactionId} committed successfully`);
    } catch (error) {
        console.error(`❌ Failed to transfer order: ${error}`);
    }
}

async function readOrderByID(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: ReadOrder, function returns order attributes');

    const orderID = 'ORD20250717001';

    try {
        const resultBytes = await contract.evaluateTransaction('QueryOrder', orderID);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result: unknown = JSON.parse(resultJson);

        console.log(`✅ Order ${orderID} found:`);
        console.log(result);
    } catch (error) {
        console.error(`❌ Failed to query order ${orderID}:`, error);
    }
}

/**
 * submitTransaction() will throw an error containing details of any error responses from the smart contract.
 */
async function updateOrder(contract: Contract): Promise<void>{
    console.log('\n--> Submit Transaction: UpdateOrder ORD20250717001, ORD20250717001 does not exist and should return an error');

    const orderID = 'ORD20250717001'; // 替换为你要更新的订单ID

    // ⚠️ 所有参数都必须传 string，即使是数字类型（链码内部用 Number() 转换）
    const userID = '101';
    const ownerID = '202';
    const startLocation = 'Shinagawa';
    const endLocation = 'Akihabara';
    const startTime = new Date().toISOString();
    const miles = '14.3';
    const orderStatus = 'completed'; // 或 pending/accepted 等等，看你的枚举类型
    const orderType = 'express';
    const cost = '5000';
    const rate = '5.0';
    const comment = 'Smooth and fast trip';

    try {
        await contract.submitTransaction(
            'UpdateOrder',
            orderID,
            userID,
            ownerID,
            startLocation,
            endLocation,
            startTime,
            miles,
            orderStatus,
            orderType,
            cost,
            rate,
            comment
        );

        console.log(`✅ Order ${orderID} updated successfully`);
    } catch (error) {
        console.error(`❌ Failed to update order: ${error}`);
    }
}

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
function displayInputParameters(): void {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${certDirectoryPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}
