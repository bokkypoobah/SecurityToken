pragma solidity ^0.4.24;

// ----------------------------------------------------------------------------
// Security Token
//
// Authors:
// * BokkyPooBah / Bok Consulting Pty Ltd
// *
//
// Sep 20 2018
// ----------------------------------------------------------------------------

import "SafeMath.sol";
import "Owned.sol";
import "ERC20Interface.sol";


/// @title IERCST Security Token Standard (EIP 1400)
/// @dev See https://github.com/SecurityTokenStandard/EIP-Spec

contract CanSendCodes {
    byte constant TRANSFER_VERIFIED_UNRESTRICTED = 0xA0;                // Transfer Verified - Unrestricted
    byte constant TRANSFER_VERIFIED_ONCHAIN_APPROVAL = 0xA1;            // Transfer Verified - On-Chain approval for restricted token
    byte constant TRANSFER_VERIFIED_OFFCHAIN_APPROVAL = 0xA2;           // Transfer Verified - Off-Chain approval for restricted token
    byte constant TRANSFER_BLOCKED_SENDER_LOCKED_PERIOD = 0xA3;         // Transfer Blocked - Sender lockup period not ended
    byte constant TRANSFER_BLOCKED_SENDER_BALANCE_INSUFFICIENT = 0xA4;  // Transfer Blocked - Sender balance insufficient
    byte constant TRANSFER_BLOCKED_SENDER_NOT_ELIGIBLE = 0xA5;          // Transfer Blocked - Sender not eligible
    byte constant TRANSFER_BLOCKED_RECEIVER_NOT_ELIGIBLE = 0xA6;        // Transfer Blocked - Receiver not eligible
    byte constant TRANSFER_BLOCKED_IDENTITY_RESTRICTION = 0xA7;         // Transfer Blocked - Identity restriction
    byte constant TRANSFER_BLOCKED_TOKEN_RESTRICTION = 0xA8;            // Transfer Blocked - Token restriction
    byte constant TRANSFER_BLOCKED_TOKEN_GRANULARITY = 0xA9;            // Transfer Blocked - Token granularity
}

/*
interface IERCST is IERCPFT {
    function getDocument(bytes32 _name) external view returns (string _uri, bytes32 _documentHash);
    function setDocument(bytes32 _name, string _uri, bytes32 _documentHash) external;
    function issuable() external view returns (bool);
    function canSend(address _from, address _to, bytes32 _tranche, uint256 _amount, bytes _data) external view returns (byte, bytes32, bytes32);
    function issueByTranche(bytes32 _tranche, address _tokenHolder, uint256 _amount, bytes _data) external;

    event IssuedByTranche(bytes32 indexed tranche, address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData);
}*/


// ----------------------------------------------------------------------------
// Contract function to receive approval and execute function in one call
//
// Borrowed from MiniMeToken
// ----------------------------------------------------------------------------
contract ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 tokens, address token, bytes data) public;
}


// ----------------------------------------------------------------------------
// MintableToken = ERC20 + symbol + name + decimals + mint + burn
//
// NOTE: This token contract allows the owner to mint and burn tokens for any
// account, and is used for testing
// ----------------------------------------------------------------------------
contract ERC20Token is ERC20Interface, Owned {
    using SafeMath for uint;

    string _symbol;
    string  _name;
    uint8 _decimals;
    uint _totalSupply;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;

    constructor(string symbol, string name, uint8 decimals, address tokenOwner, uint initialSupply) public {
        initOwned(msg.sender);
        _symbol = symbol;
        _name = name;
        _decimals = decimals;
        balances[tokenOwner] = initialSupply;
        _totalSupply = initialSupply;
        emit Transfer(address(0), tokenOwner, _totalSupply);
    }
    function symbol() public view returns (string) {
        return _symbol;
    }
    function name() public view returns (string) {
        return _name;
    }
    function decimals() public view returns (uint8) {
        return _decimals;
    }
    function totalSupply() public view returns (uint) {
        return _totalSupply.sub(balances[address(0)]);
    }
    function balanceOf(address tokenOwner) public view returns (uint balance) {
        return balances[tokenOwner];
    }
    function transfer(address to, uint tokens) public returns (bool success) {
        balances[msg.sender] = balances[msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        emit Transfer(msg.sender, to, tokens);
        return true;
    }
    function approve(address spender, uint tokens) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }
    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        balances[from] = balances[from].sub(tokens);
        allowed[from][msg.sender] = allowed[from][msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        emit Transfer(from, to, tokens);
        return true;
    }
    function allowance(address tokenOwner, address spender) public view returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }
    function approveAndCall(address spender, uint tokens, bytes data) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        ApproveAndCallFallBack(spender).receiveApproval(msg.sender, tokens, this, data);
        return true;
    }
    function mint(address tokenOwner, uint tokens) public onlyOwner returns (bool success) {
        balances[tokenOwner] = balances[tokenOwner].add(tokens);
        _totalSupply = _totalSupply.add(tokens);
        emit Transfer(address(0), tokenOwner, tokens);
        return true;
    }
    function burn(address tokenOwner, uint tokens) public onlyOwner returns (bool success) {
        if (tokens < balances[tokenOwner]) {
            tokens = balances[tokenOwner];
        }
        balances[tokenOwner] = balances[tokenOwner].sub(tokens);
        _totalSupply = _totalSupply.sub(tokens);
        emit Transfer(tokenOwner, address(0), tokens);
        return true;
    }
    function () public payable {
        revert();
    }
    function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
        return ERC20Interface(tokenAddress).transfer(owner, tokens);
    }
}
