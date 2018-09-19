var sigs = {};

function addSig(sig) {
  var bytes4 = web3.sha3(sig).substring(0, 10);
  sigs[bytes4] = sig;
}

// From DSAuth
addSig("setOwner(address)");
addSig("setAuthority(address)");

//From DSStop
addSig("stop()");
addSig("start()");

// From DSGuard
addSig("permit(bytes32,bytes32,bytes32)");
addSig("forbid(bytes32,bytes32,bytes32)");
addSig("permit(address,address,bytes32)");
addSig("forbid(address,address,bytes32)");

// From DSRoles
addSig("setRootUser(address,bool)");
addSig("setUserRole(address,uint8,bool)");
addSig("setPublicCapability(address,bytes4,bool)");
addSig("setRoleCapability(uint8,address,bytes4,bool)");

// From DSToken
addSig("mint(uint256)");
addSig("burn(uint256)");
addSig("mint(address,uint256)");
addSig("burn(address,uint256)");
addSig("setName(bytes32)");

// From DSMultiVault
addSig("push(address,address,uint256)");
addSig("pull(address,address,uint256)");
addSig("push(address,address)");
addSig("pull(address,address)");
addSig("burn(address)");

// From DSVault
addSig("swap(address)");
addSig("push(address,uint256)");
addSig("pull(address,uint256)");


// From AddressStatus
addSig("set(address,bool)");

// From FiatToken
addSig("approve(address,uint256)");
addSig("transfer(address,uint256)");
addSig("transferFrom(address,address,uint256)");
addSig("setTransferFeeCollector(address)");
addSig("setTransferFeeController(address)");

// From Gate
addSig("setLimitController(address)");
addSig("setERC20Authority(address)");
addSig("setTokenAuthority(address)");
addSig("stopToken()");
addSig("startToken()");

// From GateWithFee
addSig("setMintFeeCollector(address)");
addSig("setBurnFeeCollector(address)");
addSig("setTransferFeeCollector(address)");
addSig("setTransferFeeController(address)");
addSig("mintWithFee(address,uint256,uint256)");
addSig("burnWithFee(address,uint256,uint256)");

// From LimitController
addSig("bumpMintLimitCounter(uint256)");
addSig("bumpBurnLimitCounter(uint256)");

// From LimitSetting
addSig("setLimitCounterResetTimeOffset(int256)");
addSig("setSettingDefaultDelayHours(uint256)");
addSig("setDefaultMintDailyLimit(uint256)");
addSig("setDefaultBurnDailyLimit(uint256)");
addSig("setCustomMintDailyLimit(address,uint256)");
addSig("setCustomBurnDailyLimit(address,uint256)");

// From TokenAuth
addSig("setTokenAuthority(address)");

// From TransferFeeController
addSig("setDefaultTransferFee(uint256,uint256)");


var addressNames = {};
var nameAddresses = {};

function addAddressNames(address, name) {
  var a = address.toLowerCase();
  addressNames[a] = name;
  nameAddresses[name] = a;
}

function getAddressName(address) {
  if (address != null) {
    var a = address.toLowerCase();
    var n = addressNames[a];
    if (n !== undefined) {
      return n + ":" + address;
    }
  }
  return address;
}

function getNameFromAddress(address) {
  var a = address.toLowerCase();
  var n = addressNames[a];
  if (n !== undefined) {
    return address;
  } else {
    return "";
  }
}

function getAddressFromName(name) {
  var a = nameAddresses[name];
  if (a !== undefined) {
    return a;
  } else {
    return "";
  }
}
