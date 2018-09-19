// ETH/USD 29 Jun 2018 03:20 AEDT from CMC and ethgasstation.info
var ethPriceUSD = 435.65;
var defaultGasPrice = web3.toWei(2, "gwei");

// -----------------------------------------------------------------------------
// Accounts
// -----------------------------------------------------------------------------
var accounts = [];
var accountNames = {};

addAccount(eth.accounts[0], "Account #0 - Miner");
addAccount(eth.accounts[1], "Account #1 - Deployer");
addAccount(eth.accounts[2], "Account #2");
addAccount(eth.accounts[3], "Account #3");
addAccount(eth.accounts[4], "Account #4");
addAccount(eth.accounts[5], "Account #5");
addAccount(eth.accounts[6], "Account #6");
addAccount(eth.accounts[7], "Account #7");

var minerAccount = eth.accounts[0];
var deployer = eth.accounts[1];
var account2 = eth.accounts[2];
var account3 = eth.accounts[3];
var account4 = eth.accounts[4];
var account5 = eth.accounts[5];
var account6 = eth.accounts[6];
var account7 = eth.accounts[7];

console.log("DATA: var minerAccount=\"" + eth.accounts[0] + "\";");
console.log("DATA: var deployer=\"" + eth.accounts[1] + "\";");
console.log("DATA: var account2=\"" + eth.accounts[2] + "\";");
console.log("DATA: var account3=\"" + eth.accounts[3] + "\";");
console.log("DATA: var account4=\"" + eth.accounts[4] + "\";");
console.log("DATA: var account5=\"" + eth.accounts[5] + "\";");
console.log("DATA: var account6=\"" + eth.accounts[6] + "\";");
console.log("DATA: var account7=\"" + eth.accounts[7] + "\";");


var baseBlock = eth.blockNumber;

function unlockAccounts(password) {
  for (var i = 0; i < eth.accounts.length && i < accounts.length; i++) {
    personal.unlockAccount(eth.accounts[i], password, 100000);
    if (i > 0 && eth.getBalance(eth.accounts[i]) == 0) {
      personal.sendTransaction({from: eth.accounts[0], to: eth.accounts[i], value: web3.toWei(1000000, "ether")});
    }
  }
  while (txpool.status.pending > 0) {
  }
  baseBlock = eth.blockNumber;
}

function addAccount(account, accountName) {
  accounts.push(account);
  accountNames[account] = accountName;
  addAddressNames(account, accountName);
}


//-----------------------------------------------------------------------------
//Token A Contract
//-----------------------------------------------------------------------------
var tokenAContractAddress = null;
var tokenAContractAbi = null;

function addTokenAContractAddressAndAbi(address, abi) {
  tokenAContractAddress = address;
  tokenAContractAbi = abi;
}


//-----------------------------------------------------------------------------
//Token B Contract
//-----------------------------------------------------------------------------
var tokenBContractAddress = null;
var tokenBContractAbi = null;

function addTokenBContractAddressAndAbi(address, abi) {
  tokenBContractAddress = address;
  tokenBContractAbi = abi;
}


//-----------------------------------------------------------------------------
//Account ETH and token balances
//-----------------------------------------------------------------------------
function printBalances() {
  var tokenA = tokenAContractAddress == null || tokenAContractAbi == null ? null : web3.eth.contract(tokenAContractAbi).at(tokenAContractAddress);
  var tokenB = tokenBContractAddress == null || tokenBContractAbi == null ? null : web3.eth.contract(tokenBContractAbi).at(tokenBContractAddress);
  var decimalsA = tokenA == null ? 18 : tokenA.decimals();
  var decimalsB = tokenB == null ? 18 : tokenB.decimals();
  var i = 0;
  var totalTokenABalance = new BigNumber(0);
  var totalTokenBBalance = new BigNumber(0);
  console.log("RESULT:  # Account                                             EtherBalanceChange                 (Token A) WETH                  (Token B) DAI Name");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ------------------------------ ---------------------------");
  accounts.forEach(function(e) {
    var etherBalanceBaseBlock = eth.getBalance(e, baseBlock);
    var etherBalance = web3.fromWei(eth.getBalance(e).minus(etherBalanceBaseBlock), "ether");
    var tokenABalance = tokenA == null ? new BigNumber(0) : tokenA.balanceOf(e).shift(-decimalsA);
    var tokenBBalance = tokenB == null ? new BigNumber(0) : tokenB.balanceOf(e).shift(-decimalsB);
    totalTokenABalance = totalTokenABalance.add(tokenABalance);
    totalTokenBBalance = totalTokenBBalance.add(tokenBBalance);
    console.log("RESULT: " + pad2(i) + " " + e  + " " + pad(etherBalance) + " " +
      padToken(tokenABalance, decimalsA) + " " + padToken(tokenBBalance, decimalsB) + " " + accountNames[e]);
    i++;
  });
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ------------------------------ ---------------------------");
  console.log("RESULT:                                                                           " + padToken(totalTokenABalance, decimalsA) + " " + padToken(totalTokenBBalance, decimalsB) + " Total Token Balances");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ------------------------------ ---------------------------");
  console.log("RESULT: ");
}

function pad2(s) {
  var o = s.toFixed(0);
  while (o.length < 2) {
    o = " " + o;
  }
  return o;
}

function pad(s) {
  var o = s.toFixed(18);
  while (o.length < 27) {
    o = " " + o;
  }
  return o;
}

function padToken(s, decimals) {
  var o = s.toFixed(decimals);
  var l = parseInt(decimals)+12;
  while (o.length < l) {
    o = " " + o;
  }
  return o;
}


// -----------------------------------------------------------------------------
// Transaction status
// -----------------------------------------------------------------------------
function printTxData(name, txId) {
  var tx = eth.getTransaction(txId);
  var txReceipt = eth.getTransactionReceipt(txId);
  var gasPrice = tx.gasPrice;
  var gasCostETH = tx.gasPrice.mul(txReceipt.gasUsed).div(1e18);
  var gasCostUSD = gasCostETH.mul(ethPriceUSD);
  var block = eth.getBlock(txReceipt.blockNumber);
  console.log("RESULT: " + name + " status=" + txReceipt.status + (txReceipt.status == 0 ? " Failure" : " Success") + " gas=" + tx.gas +
    " gasUsed=" + txReceipt.gasUsed + " costETH=" + gasCostETH + " costUSD=" + gasCostUSD +
    " @ ETH/USD=" + ethPriceUSD + " gasPrice=" + web3.fromWei(gasPrice, "gwei") + " gwei block=" +
    txReceipt.blockNumber + " txIx=" + tx.transactionIndex + " txId=" + txId +
    " @ " + block.timestamp + " " + new Date(block.timestamp * 1000).toUTCString());
}

function assertEtherBalance(account, expectedBalance) {
  var etherBalance = web3.fromWei(eth.getBalance(account), "ether");
  if (etherBalance == expectedBalance) {
    console.log("RESULT: OK " + account + " has expected balance " + expectedBalance);
  } else {
    console.log("RESULT: FAILURE " + account + " has balance " + etherBalance + " <> expected " + expectedBalance);
  }
}

function failIfTxStatusError(tx, msg) {
  var status = eth.getTransactionReceipt(tx).status;
  if (status == 0) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfTxStatusError(tx, msg) {
  var status = eth.getTransactionReceipt(tx).status;
  if (status == 1) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function gasEqualsGasUsed(tx) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  return (gas == gasUsed);
}

function failIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: PASS " + msg);
    return 1;
  } else {
    console.log("RESULT: FAIL " + msg);
    return 0;
  }
}

function failIfGasEqualsGasUsedOrContractAddressNull(contractAddress, tx, msg) {
  if (contractAddress == null) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    var gas = eth.getTransaction(tx).gas;
    var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
    if (gas == gasUsed) {
      console.log("RESULT: FAIL " + msg);
      return 0;
    } else {
      console.log("RESULT: PASS " + msg);
      return 1;
    }
  }
}


//-----------------------------------------------------------------------------
// Wait one block
//-----------------------------------------------------------------------------
function waitOneBlock(oldCurrentBlock) {
  while (eth.blockNumber <= oldCurrentBlock) {
  }
  console.log("RESULT: Waited one block");
  console.log("RESULT: ");
  return eth.blockNumber;
}


//-----------------------------------------------------------------------------
// Pause for {x} seconds
//-----------------------------------------------------------------------------
function pause(message, addSeconds) {
  var time = new Date((parseInt(new Date().getTime()/1000) + addSeconds) * 1000);
  console.log("RESULT: Pausing '" + message + "' for " + addSeconds + "s=" + time + " now=" + new Date());
  while ((new Date()).getTime() <= time.getTime()) {
  }
  console.log("RESULT: Paused '" + message + "' for " + addSeconds + "s=" + time + " now=" + new Date());
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
//Wait until some unixTime + additional seconds
//-----------------------------------------------------------------------------
function waitUntil(message, unixTime, addSeconds) {
  var t = parseInt(unixTime) + parseInt(addSeconds) + parseInt(1);
  var time = new Date(t * 1000);
  console.log("RESULT: Waiting until '" + message + "' at " + unixTime + "+" + addSeconds + "s=" + time + " now=" + new Date());
  while ((new Date()).getTime() <= time.getTime()) {
  }
  console.log("RESULT: Waited until '" + message + "' at at " + unixTime + "+" + addSeconds + "s=" + time + " now=" + new Date());
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
//Wait until some block
//-----------------------------------------------------------------------------
function waitUntilBlock(message, block, addBlocks) {
  var b = parseInt(block) + parseInt(addBlocks) + parseInt(1);
  console.log("RESULT: Waiting until '" + message + "' #" + block + "+" + addBlocks + "=#" + b + " currentBlock=" + eth.blockNumber);
  while (eth.blockNumber <= b) {
  }
  console.log("RESULT: Waited until '" + message + "' #" + block + "+" + addBlocks + "=#" + b + " currentBlock=" + eth.blockNumber);
  console.log("RESULT: ");
}


//-----------------------------------------------------------------------------
// Token Contract A
//-----------------------------------------------------------------------------
var tokenAFromBlock = 0;
function printTokenAContractDetails() {
  console.log("RESULT: tokenAContractAddress=" + getAddressName(tokenAContractAddress));
  if (tokenAContractAddress != null && tokenAContractAbi != null) {
    var contract = eth.contract(tokenAContractAbi).at(tokenAContractAddress);
    var decimals = contract.decimals();
    console.log("RESULT: token.owner=" + getAddressName(contract.owner()));
    console.log("RESULT: token.symbol=" + contract.symbol());
    console.log("RESULT: token.name=" + contract.name());
    console.log("RESULT: token.decimals=" + decimals);
    console.log("RESULT: token.totalSupply=" + contract.totalSupply() + " " + contract.totalSupply().shift(-decimals));

    var latestBlock = eth.blockNumber;
    var i;

    var approvalEvents = contract.Approval({}, { fromBlock: tokenAFromBlock, toBlock: latestBlock });
    i = 0;
    approvalEvents.watch(function (error, result) {
      console.log("RESULT: token.Approval " + i++ + " #" + result.blockNumber + " tokenOwner=" + result.args.tokenOwner +
        " spender=" + result.args.spender + " tokens=" + result.args.tokens.shift(-decimals));
    });
    approvalEvents.stopWatching();

    var transferEvents = contract.Transfer({}, { fromBlock: tokenAFromBlock, toBlock: latestBlock });
    i = 0;
    transferEvents.watch(function (error, result) {
      console.log("RESULT: token.Transfer " + i++ + " #" + result.blockNumber + " from=" + result.args.from + " to=" + result.args.to +
        " tokens=" + result.args.tokens.shift(-decimals));
    });
    transferEvents.stopWatching();

    tokenAFromBlock = latestBlock + 1;
  }
}


//-----------------------------------------------------------------------------
// Token Contract B
//-----------------------------------------------------------------------------
var tokenBFromBlock = 0;
function printTokenBContractDetails() {
  console.log("RESULT: tokenBContractAddress=" + tokenBContractAddress);
  if (tokenBContractAddress != null && tokenBContractAbi != null) {
    var contract = eth.contract(tokenBContractAbi).at(tokenBContractAddress);
    var decimals = contract.decimals();
    console.log("RESULT: token.owner=" + contract.owner());
    console.log("RESULT: token.newOwner=" + contract.newOwner());
    console.log("RESULT: token.symbol=" + contract.symbol());
    console.log("RESULT: token.name=" + contract.name());
    console.log("RESULT: token.decimals=" + decimals);
    console.log("RESULT: token.totalSupply=" + contract.totalSupply().shift(-decimals));
    console.log("RESULT: token.initialised=" + contract.initialised());

    var latestBlock = eth.blockNumber;
    var i;

    var approvalEvents = contract.Approval({}, { fromBlock: tokenBFromBlock, toBlock: latestBlock });
    i = 0;
    approvalEvents.watch(function (error, result) {
      console.log("RESULT: Approval " + i++ + " #" + result.blockNumber + " owner=" + result.args.owner +
        " spender=" + result.args.spender + " tokens=" + result.args.tokens.shift(-decimals));
    });
    approvalEvents.stopWatching();

    var transferEvents = contract.Transfer({}, { fromBlock: tokenBFromBlock, toBlock: latestBlock });
    i = 0;
    transferEvents.watch(function (error, result) {
      console.log("RESULT: Transfer " + i++ + " #" + result.blockNumber + ": from=" + result.args.from + " to=" + result.args.to +
        " tokens=" + result.args.tokens.shift(-decimals));
    });
    transferEvents.stopWatching();

    tokenBFromBlock = latestBlock + 1;
  }
}


// -----------------------------------------------------------------------------
// Blacklist Contract
// -----------------------------------------------------------------------------
var blacklistContractAddress = null;
var blacklistContractAbi = null;

function addBlacklistContractAddressAndAbi(address, abi) {
  blacklistContractAddress = address;
  blacklistContractAbi = abi;
}

var blacklistFromBlock = 0;
function printBlacklistContractDetails() {
  if (blacklistFromBlock == 0) {
    blacklistFromBlock = baseBlock;
  }
  console.log("RESULT: blacklist.address=" + getAddressName(blacklistContractAddress));
  if (blacklistContractAddress != null && blacklistContractAbi != null) {
    var contract = eth.contract(blacklistContractAbi).at(blacklistContractAddress);
    console.log("RESULT: blacklist.authority=" + getAddressName(contract.authority()));
    console.log("RESULT: blacklist.owner=" + getAddressName(contract.owner()));

    var latestBlock = eth.blockNumber;
    var i;

    var logSetAuthorityEvents = contract.LogSetAuthority({}, { fromBlock: blacklistFromBlock, toBlock: latestBlock });
    i = 0;
    logSetAuthorityEvents.watch(function (error, result) {
      console.log("RESULT: blacklist.LogSetAuthority " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    logSetAuthorityEvents.stopWatching();

    var logSetOwnerEvents = contract.LogSetOwner({}, { fromBlock: blacklistFromBlock, toBlock: latestBlock });
    i = 0;
    logSetOwnerEvents.watch(function (error, result) {
      console.log("RESULT: blacklist.LogSetOwner " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    logSetOwnerEvents.stopWatching();

    var logSetAddressStatusEvents = contract.LogSetAddressStatus({}, { fromBlock: blacklistFromBlock, toBlock: latestBlock });
    i = 0;
    logSetAddressStatusEvents.watch(function (error, result) {
      console.log("RESULT: blacklist.LogSetAddressStatus " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    logSetAddressStatusEvents.stopWatching();

    blacklistFromBlock = latestBlock + 1;
  }
}


// -----------------------------------------------------------------------------
// Kyc Contract
// -----------------------------------------------------------------------------
var kycContractAddress = null;
var kycContractAbi = null;

function addKycContractAddressAndAbi(address, abi) {
  kycContractAddress = address;
  kycContractAbi = abi;
}

var kycFromBlock = 0;
function printKycContractDetails() {
  if (kycFromBlock == 0) {
    kycFromBlock = baseBlock;
  }
  console.log("RESULT: kyc.address=" + getAddressName(kycContractAddress));
  if (kycContractAddress != null && kycContractAbi != null) {
    var contract = eth.contract(kycContractAbi).at(kycContractAddress);
    console.log("RESULT: kyc.authority=" + getAddressName(contract.authority()));
    console.log("RESULT: kyc.owner=" + getAddressName(contract.owner()));

    var latestBlock = eth.blockNumber;
    var i;

    var logSetAuthorityEvents = contract.LogSetAuthority({}, { fromBlock: kycFromBlock, toBlock: latestBlock });
    i = 0;
    logSetAuthorityEvents.watch(function (error, result) {
      console.log("RESULT: kyc.LogSetAuthority " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    logSetAuthorityEvents.stopWatching();

    var logSetOwnerEvents = contract.LogSetOwner({}, { fromBlock: kycFromBlock, toBlock: latestBlock });
    i = 0;
    logSetOwnerEvents.watch(function (error, result) {
      console.log("RESULT: kyc.LogSetOwner " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    logSetOwnerEvents.stopWatching();

    var logSetAddressStatusEvents = contract.LogSetAddressStatus({}, { fromBlock: kycFromBlock, toBlock: latestBlock });
    i = 0;
    logSetAddressStatusEvents.watch(function (error, result) {
      console.log("RESULT: kyc.LogSetAddressStatus " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    logSetAddressStatusEvents.stopWatching();

    kycFromBlock = latestBlock + 1;
  }
}
