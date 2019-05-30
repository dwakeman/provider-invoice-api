/**
 * Copyright 2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const log4js = require('log4js');
const config = require('config');

const util = require('../helpers/util');
const utl = require('util');
const logger = log4js.getLogger('controllers - getTransaction');
logger.setLevel(config.logLevel);

/**
 * Controller object
 */
const invoice = {};

invoice.getTransaction = async (req, res, next) => {
  logger.debug('entering >>> getTransaction()');

  let txId = req.query.txId;
  logger.debug('the transaction ID is' + txId);



  let jsonRes;
  try {
    // More info on the following calls: https://fabric-sdk-node.github.io/release-1.4/Channel.html#queryTransaction__anchor

    // get contract instance retrieved in fabric-routes middleware
    const contract = res.locals.mychannel["health-invoice-reconciliation"];

    // get the channel instance retrieved in fabric-routes middleware
    const channel = res.locals.mychannel.network.getChannel();
    logger.debug('the channel is ' + channel.toString());

    // query transaction by Id.  Format of txn is defined here: https://fabric-sdk-node.github.io/release-1.4/global.html#ProcessedTransaction
    const txn = await channel.queryTransaction(txId);

//    logger.debug('The retrieved transaction is:');
//    logger.debug(JSON.stringify(txn));


    // remove any binary data in buffers
    delete txn.transactionEnvelope["signature"];
    delete txn.transactionEnvelope.payload.header.signature_header["nonce"];

    // convert the buffers to strings
    txn.transactionEnvelope.payload.header.channel_header.extension = txn.transactionEnvelope.payload.header.channel_header.extension.toString();

    for (var x=0;x < txn.transactionEnvelope.payload.data.actions.length;x++) {
        for (var y=0;y < txn.transactionEnvelope.payload.data.actions[x].payload.chaincode_proposal_payload.input.chaincode_spec.input.args.length;y++) {
            txn.transactionEnvelope.payload.data.actions[x].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[y] = 
                txn.transactionEnvelope.payload.data.actions[x].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[y].toString();
            
            delete txn.transactionEnvelope.payload.data.actions[x].header["nonce"];

            for (var z=0;z < txn.transactionEnvelope.payload.data.actions[x].payload.action.endorsements.length; z++) {
                delete txn.transactionEnvelope.payload.data.actions[x].payload.action.endorsements[z]["signature"];
            }
        }
    }

    jsonRes = {
      statusCode: 200,
      success: true,
      result: txn
    };
  } catch (err) {
    logger.debug('Error querying the transaction...');
    logger.debug(JSON.stringify(err));

    jsonRes = {
      statusCode: 500,
      success: false,
      message: `${err.message}`,
    };
  }

  logger.debug('exiting <<< getTransaction()');
  util.sendResponse(res, jsonRes);
  next(); // middleware call to disconnect from gateway
};



module.exports = invoice;
