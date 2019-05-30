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
const logger = log4js.getLogger('controllers - createInvoice');
logger.setLevel(config.logLevel);

/**
 * Controller object
 */
const invoice = {};


// this function maps to the "/invoice" POST
// chaincode: createInvoice(ctx,invoiceNo, invoiceName, invoiceDate, lob, quantiy, price)
invoice.createInvoice = async (req, res, next) => {
    logger.debug('entering >>> createInvoice()');
/*  
    let invoiceNo = "12329592";
    let invoiceName = "DaveCares Health";
    let invoiceDate = "04-02-2019";
    let lob = "Medical";
    let quantity = "1";
    let price = "250";
*/

    // Get parameters from the Request object
    let invoice = req.body;

    logger.debug("Request parameters");
    logger.debug("Invoice: " + JSON.stringify(invoice));


    let jsonRes;
    try {
      // More info on the following calls: https://fabric-sdk-node.github.io/Contract.html
  
      // get contract instance retrieved in fabric-routes middleware
      const contract = res.locals.mychannel["health-invoice-reconciliation"];
  
      // invoke transaction
      // Create transaction proposal for endorsement and sendTransaction to orderer
      const invokeResponse = await contract.submitTransaction('createInvoice', JSON.stringify(invoice));
  
      // query
      // simply query the ledger
      // const queryResponse = await contract.evaluateTransaction('Health');
  
      jsonRes = {
        statusCode: 200,
        success: true,
        result: invokeResponse.toString(),
      };
    } catch (err) {
      logger.debug('Error evaluating transaction createInvoice...');
      logger.debug(JSON.stringify(err));
  
      jsonRes = {
        statusCode: 500,
        success: false,
        message: `${err.message}`,
      };
    }
  
    logger.debug('exiting <<< createInvoice()');
    util.sendResponse(res, jsonRes);
    next(); // middleware call to disconnect from gateway
  };


module.exports = invoice;
