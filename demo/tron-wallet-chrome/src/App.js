import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import AccountBalanceWallet from '@material-ui/icons/AccountBalanceWallet';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/Close';
import Send from '@material-ui/icons/Send';
import AttachMoney from '@material-ui/icons/AttachMoney';
import Launch from '@material-ui/icons/Launch';
import VpnKey from '@material-ui/icons/VpnKey';
import Lock from '@material-ui/icons/Lock';
import AddCircle from '@material-ui/icons/AddCircle';
import MonetizationOn from '@material-ui/icons/MonetizationOn';
import CheckCircle from '@material-ui/icons/CheckCircle';
import LockOpen from '@material-ui/icons/LockOpen';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import * as QRCode from "qrcode";
import xhr from "axios";
import moment from 'moment';
import {find, filter, sumBy, omit} from "lodash";
import Countdown from 'react-countdown-now';
import "react-datetime/css/react-datetime.css";
import DateTimePicker from 'react-datetime';
import {BigNumber} from 'bignumber.js';
import {Client} from '@tronscan/client';
import {isAddressValid} from '@tronscan/client/src/utils/crypto';
import {generateAccount} from '@tronscan/client/src/utils/account';
import {pkToAddress} from '@tronscan/client/src/utils/crypto';
import logo from './images/tron-logo.svg';
import TronLogo from "./images/trans_tron_logo.png";
import './App.css';

const ONE_TRX = 1000000;
const CREATE_TOKEN_COST = 1024;
const client = new Client();

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const defaultTokenCreate = { totalSupply: 100000, trxAmount: 1, tokenAmount: 1, website: 'http://', frozenAmount: 0, frozenDays: 0 };

class App extends Component {
  state = {
    account: null,
    accountDetailsOpen: false, 
    receiveOpen: false,
    sendOpen: false,
    freezeOpen: false,
    unfreezeOpen: false,
    votesOpen: false,
    tokenCreateOpen: false,
    tokenParticipateOpen: false,
    snackbarOpen: false,
    isLoading: false,
    votes: {},
    voteSearchTerm: '',
    backupPrivateKeyOpen: false,
    showPrivateKey: false,
    tokenCreate: defaultTokenCreate,
    issuedToken: null,
    buyingTokens: {}
  };

  clear = () => {
    this.setState({
      privateKey: null,
      address: null,
      account: null,
      accountDetailsOpen: false, 
      receiveOpen: false,
      sendOpen: false,
      freezeOpen: false,
      unfreezeOpen: false,
      votesOpen: false,
      tokenCreateOpen: false,
      tokenParticipateOpen: false,
      snackbarOpen: false,
      isLoading: false,
      votes: {},
      voteSearchTerm: '',
      backupPrivateKeyOpen: false,
      showPrivateKey: false,
      transactions: undefined,
      signInPrivateKey: '',
      tokenCreate: defaultTokenCreate,
      issuedToken: null,
      buyingTokens: {}
    });
  }

  componentDidMount() {
    this.loadPrice();
    this.loadWitnesses();
    this.loadTokenCreate();
    this.loadTokens();
  }

  componentDidUpdate() {
    if (!this.state.account) {
      return;
    }
    
    const tokenBalances = this.state.account.balances;
    if (!this.state.sendToken && tokenBalances.length > 0) {
      this.setState({
        sendToken: tokenBalances[0].name,
      })
    }
  }

  async loadAccount() {
    if (this.state.address) {
      const account = await client.getAccountBalances(this.state.address);
      this.setState({ account });
    }
  }

  async loadAccountVotes() {
    if (this.state.address) {
      const data = await client.getAccountVotes(this.state.address);
      this.setState({ votes: data.votes });
    }
  }

  async loadPrice() {
    const { data } = await xhr.get(`https://api.coinmarketcap.com/v1/ticker/tronix/`);
    this.setState({ price: data[0] });
  }

  async loadWitnesses() {
    let { witnesses } = await client.getWitnesses();
    witnesses.sort((a, b) => b.votes - a.votes);
    this.setState({ witnesses });
  }

  async loadTransactions() {
    if (this.state.address) {
      const { data } = await xhr.get(`https://api.tronscan.org/api/transfer?sort=-timestamp&count=true&limit=10&address=${this.state.address}`);
      this.setState({ transactions: data.data });
    }
  }

  async loadTokens() {
    const limit = this.state.tokensTotal ? this.state.tokensTotal : 100;
    const {tokens, total} = await client.getTokens({
      sort: '-name',
      status: 'ico',
      limit,
      start: 0
    });
    this.setState({ tokens, tokensTotal: total });
  }
  
  showAccountDetails = () => {
    this.setState({ accountDetailsOpen: true });
  };

  handleAccountDetailsClose = () => {
    this.setState({ accountDetailsOpen: false });
  };

  renderTron() {
    if (!this.state.account || !this.state.price) {
      return (
        <div>
          <LinearProgress/>
        </div>
      );
    }

    const trx = find(this.state.account.balances, token => token.name === "TRX");
    const price = this.state.price;

    return (
      <div>
        {
          trx && price && <Card className="card">
              <img src={TronLogo} alt="Tron" className="tron-logo"/>
              <div className="balance">{trx.balance} TRX</div>
              <div className="price">${price.price_usd} <span className={price.percent_change_24h > 0 ? "green" : "red"}>{price.percent_change_24h}%</span></div>
              <div className="address">
                <span>{this.state.address}</span>
                <Tooltip title="Account details">
                  <IconButton aria-label="Details" onClick={this.showAccountDetails}>
                    <AccountBalanceWallet />
                  </IconButton>
                </Tooltip>  
              </div>
          </Card>
        }
      </div>
    )
  }

  async loadQRCode() {
    const qrcode = await QRCode.toDataURL(this.state.address);
    this.setState({ qrcode });
  }

  goToTronscan = () => {
    window.open(`https://tronscan.org/#/address/${this.state.address}`, '_blank');
  }

  goToTronscanTokens = () => {
    window.open(`https://tronscan.org/#/address/${this.state.address}/token-balances`, '_blank');
  }

  renderAccountDetails() {
    if (!this.state.account) {
      return null;
    }
    if (!this.state.qrcode) {
      this.loadQRCode();
    }
    
    return (
      <Dialog
          fullScreen
          open={this.state.accountDetailsOpen}
          onClose={this.handleAccountDetailsClose}
          TransitionComponent={Transition} >
          <AppBar position="static" className="appBar">
            <Toolbar>
              <Tooltip title="Close">
                <IconButton color="inherit" onClick={this.handleAccountDetailsClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="title" color="inherit">
                Account Details
              </Typography>
            </Toolbar>
          </AppBar>
          <div>
          <Card className="card account-details-card">
            <Typography variant="title">
              Address
            </Typography>
            { 
              this.state.qrcode && <img src={this.state.qrcode} style={{ width: '50%' }} alt="account address" className="m-1" />
            }
            <div className="account-details-address">
              <span>{this.state.address}</span>
            </div>
          </Card>
          <div className="account-details-button-container">
            <Button variant="raised" color="primary" onClick={this.goToTronscan}>
              View account on tronscan <Launch className="account-details-button-icon"/>
            </Button>
            <Button variant="raised" color="primary" onClick={() => this.setState( {showPrivateKey: true} )}>
              Show private key <VpnKey className="account-details-button-icon"/>
            </Button>
            <div className={this.state.showPrivateKey ?  "show-private-key" : "show-private-key hide"}>
              {this.state.privateKey}
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
  
  showReceive = () => {
    this.setState({ receiveOpen: true });
  };

  handleReceiveClose = () => {
    this.setState({ receiveOpen: false });
  };

  renderReceive() {
    if (!this.state.account) {
      return null;
    }
    if (!this.state.qrcode) {
      this.loadQRCode();
    }
    
    return (
      <Dialog
          fullScreen
          open={this.state.receiveOpen}
          onClose={this.handleReceiveClose}
          TransitionComponent={Transition} >
          <AppBar position="static" className="appBar">
            <Toolbar>
              <Tooltip title="Close">
                <IconButton color="inherit" onClick={this.handleReceiveClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="title" color="inherit">
                Receive
              </Typography>
            </Toolbar>
          </AppBar>
          <div>
          <Card className="card account-details-card">
            <Typography variant="title">
              Send to this address
            </Typography>
            { 
              this.state.qrcode && <img src={this.state.qrcode} style={{ width: '50%' }} alt="account address" className="m-1" />
            }
            <div className="account-details-address">
              <span>{this.state.address}</span>
            </div>
          </Card>
        </div>
      </Dialog>
    )
  }

  showSend = () => {
    this.setState({ sendOpen: true });
  };

  handleSendClose = () => {
    this.setState({ sendOpen: false });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleCheckboxChange = name => event => {
    this.setState({
      [name]: event.target.checked,
    });
  };

  setSendAmount = (amount) => {
    const sendAmount = amount.replace(/^0+(?!\.|$)/, '').replace(/[^0-9 .]+/g,'').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1");

    this.setState({
      sendAmount
    });

  };

  isAddress = (address) => {
    try {
      return isAddressValid(address);
    } catch (e) {
      return false;
    }
  };

  getSelectedTokenBalance = () => {
    const tokenBalances = this.state.account.balances;
    const token = this.state.sendToken;

    if (token) {
      return parseFloat(find(tokenBalances, t => t.name === token).balance);
    }

    return 0;
  };

  isSendValid = () => {
    const {sendTo, sendToken, sendAmount} = this.state;
    const address = this.state.address;

    return this.isAddress(sendTo) && sendToken !== "" && this.getSelectedTokenBalance() >= sendAmount && sendAmount > 0 && sendTo !== address;
  };

  //sign


  sendToken = async () => {
    const {sendTo, sendToken, sendAmount, privateKey, address} = this.state;
    this.setState({ isLoading: true });
    
    let amount = sendAmount;
    if (sendToken === 'TRX') {
      amount = sendAmount * ONE_TRX;
    }

    const sendResult = await client.send(sendToken, address, sendTo, amount)(privateKey);

    if (sendResult.success) {
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: 'Succesfully sent tokens!',
        sendTo: '',
        sendAmount: '',
      }, () => {
        this.loadAccount();
        this.loadTransactions();
        setTimeout(()=> {
          this.loadAccount();
          this.loadTransactions();
        }, 1000)
        setTimeout(()=> {
          this.loadAccount();
          this.loadTransactions();
        }, 5000)
        setTimeout(()=> {
          this.loadAccount();
          this.loadTransactions();
        }, 10000)
      });
    } else {
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: `Sent failed, ${sendResult.message}, please retry later.`,
      });
    }
  };

  renderSend() {
    if (!this.state.account) {
      return null;
    }

    const tokenBalances = this.state.account.balances;
    return (
      <Dialog
          fullScreen
          open={this.state.sendOpen}
          onClose={this.handleSendClose}
          TransitionComponent={Transition} >
          <AppBar position="static" className="appBar">
            <Toolbar>
              <Tooltip title="Close">
                <IconButton color="inherit" onClick={this.handleSendClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="title" color="inherit">
                Send
              </Typography>
            </Toolbar>
          </AppBar>
          <div>
          <Card className="card send-card">
            <TextField
              required
              label="To"
              className="send-to"
              value={this.state.sendTo}
              onChange={this.handleChange('sendTo')}
              margin="normal" />
            <TextField
              select
              className="send-token"
              value={this.state.sendToken}
              onChange={this.handleChange('sendToken')}
              helperText="Please select the token to send"
              margin="normal"
            >
              {tokenBalances.map(option => (
                <MenuItem key={option.name} value={option.name}>
                  {`${option.name} (${option.balance})`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              label="Amount"
              className="send-amount"
              value={this.state.sendAmount}
              onChange={(ev) => this.setSendAmount(ev.target.value) }
              margin="normal" 
              type="number"
              placeholder="0.00" />
            <Button 
              id="send-token-button"
              className="send-token-button" 
              variant="raised" 
              color="primary" 
              disabled={!this.isSendValid() || this.state.isLoading}
              onClick={this.sendToken}>
              Send <Send className="send-button-icon"/>
            </Button>
          </Card>
        </div>
      </Dialog>
    )
  }

  renderSendReceiveButtons() {
    if (!this.state.account) {
      return null;
    }

    return (
      <div className="buttons-container">
        <Button variant="raised" color="primary" onClick={this.showReceive}>
          Receive <AttachMoney className="receive-button-icon"/>
        </Button>
        <Button variant="raised" color="primary" onClick={this.showSend}>
          Send <Send className="send-button-icon"/>
        </Button>
      </div>
    )
  }

  handleSnackbardClose = () => {
    this.setState({ snackbarOpen: false });
  };

  renderSnackbar() {
    return(
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={this.state.snackbarOpen}
        autoHideDuration={6000}
        onClose={this.handleSnackbardClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{this.state.snackbarMessage}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={this.handleSnackbardClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    )
  }

  renderFrozenTokens() {
    if (this.state.account && this.state.account.frozen 
      && this.state.account.frozen.balances 
      && this.state.account.frozen.balances.length >= 1) {
      return (
        <div className="frozen-tokens">
          <div><b>{this.state.account.frozen.balances[0].amount / ONE_TRX} TRX</b> have been frozen</div>
          <div>Expires at {moment(this.state.account.frozen.balances[0].expires).format('MMMM Do YYYY, h:mm:ss a')}</div>
        </div>
      )
    }
    return null;
  }

  renderTronPower() {
    if (!this.state.account) {
      return null;
    }

    const hasFrozenTrx = this.state.account && this.state.account.frozen 
      && this.state.account.frozen.balances 
      && this.state.account.frozen.balances.length >= 1
      && this.state.account.frozen.balances[0].amount > 0;

    return (
      <Card className="card tron-power-card">
        <Typography variant="title">
          Tron Power
        </Typography>
        <p className="tron-power-description">TRX can be frozen to gain <b>Tron Power</b> and bandwidth. You can vote for Super Representatives using Tron Power. Frozen tokens are locked for 3 days. The frozen TRX cannot be traded during that period. After that period you can unfreeze the TRX and trade the tokens.</p>
        { this.renderFrozenTokens() }
        <div className="tron-power-buttons">
          <Button variant="outlined" onClick={this.showFreeze}>
            Freeze <Lock className="account-details-button-icon"/>
          </Button>
          { hasFrozenTrx && <Button variant="outlined" onClick={this.showUnfreeze}>
              Unfreeze <LockOpen className="account-details-button-icon"/>
            </Button>
          }
        </div>
      </Card>
    )
  }

  showFreeze = () => {
    this.setState({ freezeOpen: true });
  };

  handleFreezeClose = () => {
    this.setState({ freezeOpen: false });
  };

  setFreezeAmount = (value) => {
    const tokenBalance = this.state.account.balances[0].balance;
    let amount = parseInt(value, 10);

    if (!isNaN(amount)) {
      amount = amount > 0 ? Math.floor(amount) : Math.abs(amount);
      amount = amount < tokenBalance ? amount : tokenBalance;
      amount = Math.round(amount);
    } else {
      amount = '';
    }

    this.setState({
      freezeAmount: amount,
    });
  };

  isFreezeAmountValid() {
    return typeof this.state.freezeAmount === 'number' && this.state.freezeAmount > 0;
  }

  freezeToken = async () => {
    const {freezeAmount, address, privateKey} = this.state;
    this.setState({ isLoading: true });

    const freezeResult = await client.freezeBalance(address, freezeAmount * ONE_TRX, 3)(privateKey);
    console.log(freezeResult);
    if (freezeResult.success) {
      this.loadAccount();
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: 'Succesfully freeze tokens!',
        freezeAmount: '',
      });
    } else {
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: `Freeze failed, ${freezeResult.message}, please retry later.`,
      });
    }
  };

  renderFreeze() {
    if (!this.state.account) {
      return null;
    }

    const tokenBalance = Math.round(this.state.account.balances[0].balance);
    const confirmationMessage = this.state.freezeAmount ? `I confirm to freeze ${this.state.freezeAmount} TRX for at least 3 days.`: 'I confirm to freeze TRX for at least 3 days.';
    return (
      <Dialog
          fullScreen
          open={this.state.freezeOpen}
          onClose={this.handleFreezeClose}
          TransitionComponent={Transition} >
          <AppBar position="static" className="appBar">
            <Toolbar>
              <Tooltip title="Close">
                <IconButton color="inherit" onClick={this.handleFreezeClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="title" color="inherit">
                Freeze
              </Typography>
            </Toolbar>
          </AppBar>
          <div>
          <Card className="card send-card">
            { (tokenBalance > 0) && <p>You can freeze upto {tokenBalance} TRX.</p> }
            { (tokenBalance <= 0) && <p>You don't have any TRX to freeze.</p> }
            <TextField
              required
              label="Freeze amount"
              className="freeze-amount"
              value={this.state.freezeAmount}
              onChange={(ev) => this.setFreezeAmount(ev.target.value) }
              margin="normal" 
              type="number"
              placeholder="0" />
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.freezeConfirm}
                  onChange={this.handleCheckboxChange('freezeConfirm')}
                  value="freezeConfirm"
                  color="primary"
                />
              }
              label={confirmationMessage}
              disabled={!this.isFreezeAmountValid() || this.state.isLoading}
            />
            <Button 
              id="freeze-token-button"
              className="send-token-button" 
              variant="raised" 
              color="primary" 
              disabled={!this.isFreezeAmountValid() || !this.state.freezeConfirm || this.state.isLoading}
              onClick={this.freezeToken}>
              Freeze <Lock className="send-button-icon"/>
            </Button>
          </Card>
        </div>
      </Dialog>
    )
  }

  showUnfreeze = () => {
    this.setState({ unfreezeOpen: true });
  };

  handleUnfreezeClose = () => {
    this.setState({ unfreezeOpen: false });
  };
  
  unfreezeToken = async () => {
    const {address, privateKey} = this.state;
    this.setState({ isLoading: true });

    const unfreezeResult = await client.unfreezeBalance(address)(privateKey);
    console.log(unfreezeResult);
    if (unfreezeResult.success) {
      this.loadAccount();
      this.setState({
        isLoading: false,
        unfreezeOpen: false,
        snackbarOpen: true,
        snackbarMessage: 'Succesfully unfreeze tokens!',
      });
    } else {
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: `Unfreeze failed, ${unfreezeResult.message}, please retry later.`,
      });
    }
  };

  renderUnfreeze() {
    if (this.state.account && this.state.account.frozen 
      && this.state.account.frozen.balances 
      && this.state.account.frozen.balances.length >= 1) {
        const frozenBalance = this.state.account.frozen.balances[0];
        const hasEnoughFrozenBalance = frozenBalance.amount > 0;
        const hasExpired = moment().diff(frozenBalance.expires) >= 0;
        const canUnfreeze = hasEnoughFrozenBalance && hasExpired;
        return (
          <Dialog
              fullScreen
              open={this.state.unfreezeOpen}
              onClose={this.handleUnfreezeClose}
              TransitionComponent={Transition} >
              <AppBar position="static" className="appBar">
                <Toolbar>
                  <Tooltip title="Close">
                    <IconButton color="inherit" onClick={this.handleUnfreezeClose} aria-label="Close">
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="title" color="inherit">
                    Unfreeze
                  </Typography>
                </Toolbar>
              </AppBar>
              <Card className="card send-card">
                <div className="unfreeze-message">
                  <p><b>{frozenBalance.amount / ONE_TRX} TRX</b> have been frozen. Expires at {moment(frozenBalance.expires).format('MMMM Do YYYY, h:mm:ss a')}</p>
                  { !hasEnoughFrozenBalance && <p>No frozen TRX to unfreeze.</p>}
                  { !hasExpired && <p>You need to wait until the frozen TRX expires.</p>}
                  { canUnfreeze && <p>Are you sure you want to unfreeze {frozenBalance.amount / ONE_TRX} TRX?</p>}
                </div>
                <Button 
                  id="unfreeze-token-button"
                  className="send-token-button" 
                  variant="raised" 
                  color="primary" 
                  disabled={!canUnfreeze || this.state.isLoading}
                  onClick={this.unfreezeToken}>
                  Unfreeze <Lock className="send-button-icon"/>
                </Button>
              </Card>
          </Dialog>
        )
    }

    return null;
  }

  diffSeconds() {
    var now = new Date();
    var utcHour = now.getUTCHours();
    var fromTime = new Date(2000, 1, 1, utcHour, now.getMinutes(), now.getSeconds());
  
    var nextHour = 24;
    
    if (utcHour >= 0 && utcHour < 6) {
        nextHour = 6;
    }     
    if (utcHour >= 6 && utcHour < 12) {
        nextHour = 12;
    }   
    if (utcHour >= 12 && utcHour < 18) {
        nextHour = 18;
    }    
    if (utcHour >= 18 && utcHour < 24) {
        nextHour = 24;
    }  
    var toTime = new Date(2000, 1, 1, nextHour, 0, 0);      

    var dif = fromTime.getTime() - toTime.getTime();
    var secondsDiff = Math.abs(dif);
  
    return secondsDiff;
}

rendererClock = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    return (<span>Counting votes...</span>);
  }else{
    return (
      <div className="vote-countdown">
          <div>Next Votecycle</div>
          <div>{hours}:{minutes}:{seconds}</div>
      </div>
    );
  }
};

renderVotesCard() {
  if (!this.state.account) {
    return null;
  }

  const hasFrozenTrx = this.state.account && this.state.account.frozen 
    && this.state.account.frozen.balances 
    && this.state.account.frozen.balances.length >= 1
    && this.state.account.frozen.balances[0].amount > 0;

  return (
    <Card className="card tron-power-card">
      <Typography variant="title">
        Votes
      </Typography>
      <p className="tron-power-description">
        You can use <b>Tron Power</b> to vote Super Representatives. One TRX for one vote.
      </p>
      {
        !hasFrozenTrx && <p className="tron-power-description">
          You don't have any Tron Power, pleae freeze some TRX to gain <b>Tron Power</b> to vote.
        </p>
      }

      <Countdown date={Date.now() + this.diffSeconds()} renderer={this.rendererClock}>
      </Countdown>
      <div className="vote-button-container">
        <Button 
        className="vote-button" 
        variant="outlined" 
        disabled={!hasFrozenTrx}
        onClick={this.showVotes}>
          Vote <CheckCircle className="account-details-button-icon"/>
        </Button>
      </div>
    </Card>
    )
  }

  showVotes = () => {
    this.setState({ votesOpen: true });
  };

  handleVotesClose = () => {
    this.setState({ votesOpen: false });
  };

  setVote = (address, numberOfVotes) => {
    const frozenBalance = this.state.account.frozen.balances[0].amount / ONE_TRX;
    let {votes, remainingVotes } = this.state;

    if (numberOfVotes !== '') {
      numberOfVotes = parseInt(numberOfVotes, 10);

      if (numberOfVotes < 0) {
        numberOfVotes = 0;
      }
    }

    votes[address] = numberOfVotes;

    const votesSpend = sumBy(Object.values(votes), vote => parseInt(vote, 10) || 0);
    const votesExceptCurrent = omit(votes, [address])
    const actualRemainingVotes = sumBy(Object.values(votesExceptCurrent), vote => parseInt(vote, 10) || 0);
    if (votesSpend > frozenBalance) {
      votes[address] = frozenBalance - actualRemainingVotes;
      remainingVotes = 0;
    } else {
      remainingVotes = frozenBalance - votesSpend;
    }

    this.setState({
      votes,
      remainingVotes
    });
  };

  filteredWitnesses() {
    let {witnesses, voteSearchTerm} = this.state;
    voteSearchTerm = voteSearchTerm.toUpperCase();

    if (voteSearchTerm.length > 0) {
      witnesses = filter(
        witnesses, w =>
          w.address.toUpperCase().indexOf(voteSearchTerm) !== -1 ||
          w.url.toUpperCase().indexOf(voteSearchTerm) !== -1);
    }

    return witnesses;
  }

  renderVotesTable() {
    const witnesses = this.filteredWitnesses();

    return (
      <Table className="vote-table">
        <TableHead>
          <TableRow>
            <TableCell className="super-representative-number">#</TableCell>
            <TableCell className="super-representative-name">Super Representative</TableCell>
            <TableCell className="super-representative-votes" numeric>Votes</TableCell>
            <TableCell className="super-representative-your-vote" numeric>Your vote</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {witnesses.map((account, index) => {
            let url = account.url;
            if (url.length > 24) {
              url = url.substr(0, 50) + '...';
            }
            return (
              <TableRow key={account.address}>
                <TableCell className="super-representative-number" component="th" scope="row">
                  {index+1}
                </TableCell>
                <TableCell className="super-representative-name">
                  {account.address.substr(0, 50)}...<br/>
                  <small>{url}</small>
                </TableCell>
                <TableCell className="super-representative-votes" numeric>{account.votes}</TableCell>
                <TableCell className="super-representative-your-vote" numeric>
                  <TextField
                    className="vote-amount"
                    value={this.state.votes[account.address]}
                    onChange={(ev) => this.setVote(account.address, ev.target.value) }
                    margin="normal" 
                    type="number"
                    placeholder="0" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )
  }

  vote = async () => {
    const {privateKey, address, votes} = this.state;
    this.setState({ isLoading: true });

    const voteResult = await client.voteForWitnesses(address, votes)(privateKey);
    console.log(voteResult);
    if (voteResult.success) {
      this.loadAccount();
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: 'Succesfully vote!',
      });
    } else {
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: `Vote failed, ${voteResult.message}, please retry later.`,
      });
    }
  };

  renderVotes() {
    const {witnesses, account, votes} = this.state;
    if (!witnesses) {
      return (null);
    }

    if (account && account.frozen 
      && account.frozen.balances 
      && account.frozen.balances.length >= 1) {
        
        const frozenBalance = account.frozen.balances[0].amount / ONE_TRX;
        const hasEnoughFrozenBalance = frozenBalance > 0;
        const hasFilledVote = sumBy(Object.values(votes), vote => parseInt(vote, 10) || 0) > 0;

        let {remainingVotes} = this.state;
        if (typeof remainingVotes === 'undefined') {
          remainingVotes = frozenBalance;
        }

        return (
          <Dialog
              fullScreen
              open={this.state.votesOpen}
              onClose={this.handleVotesClose}
              TransitionComponent={Transition} >
              <AppBar position="sticky" className="appBar">
                <Toolbar>
                  <Tooltip title="Close">
                    <IconButton color="inherit" onClick={this.handleVotesClose} aria-label="Close">
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="title" color="inherit">
                    Votes
                  </Typography>
                </Toolbar>
                <div className="vote-container">
                  <div className="vote-message">
                    { hasEnoughFrozenBalance && <p>You have {frozenBalance} Tron Power. Remaining <b>{remainingVotes} Tron Power</b> to vote.</p> }
                    { !hasEnoughFrozenBalance && <p>No frozen TRX to vote.</p>}
                  </div>
                  <span id="vote-search-term-container">
                    <TextField
                      id="vote-search-term"
                      label="Search URL or address"
                      value={this.state.voteSearchTerm}
                      onChange={this.handleChange('voteSearchTerm')}
                      margin="normal"
                    />
                  </span>
                  <Button 
                    id="submit-vote-button"
                    className="send-token-button" 
                    variant="raised" 
                    disabled={!hasEnoughFrozenBalance || !hasFilledVote || this.state.isLoading}
                    onClick={this.vote}>
                    Vote <CheckCircle className="send-button-icon"/>
                  </Button>
                </div>
              </AppBar>
              <div className="vote-card">
                {this.renderVotesTable()}
              </div>
          </Dialog>
        )
    } else {
      return null;
    }
  }

  createAccount = () => {
    const account = generateAccount();
    this.setState({
      address: account.address,
      privateKey: account.privateKey,
      backupPrivateKeyOpen: true,
    }, () => {
      this.prepareKey(account.privateKey);
    }); 
  };

  handleBackupPrivateKeyClose = () => {
    this.setState({
      backupPrivateKeyOpen: false,
    })
  }

  isPrivateKeyValid = () => {
    let {signInPrivateKey} = this.state;
    if (!signInPrivateKey || signInPrivateKey.length === 0) {
      return false;
    }
    signInPrivateKey = signInPrivateKey.toUpperCase();

    if (signInPrivateKey.length !== 64) {
      return false;
    }

    const pk = new BigNumber('0x' + signInPrivateKey)
    if (pk.isInteger()) {
      const N = new BigNumber('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');
      return pk.isLessThan(N);
    }

    return false;
  }
    
  prepareKey = (key) => {
    const address = pkToAddress(key);

    this.setState({
      privateKey: key,
      address
    }, () => {
      this.loadAccount();
      this.loadAccountVotes();
      this.loadTransactions();
      this.loadIssuedToken();
    });
  };

  signIn = () => {
    let {signInPrivateKey} = this.state;
    signInPrivateKey = signInPrivateKey.toUpperCase();
    const address = pkToAddress(signInPrivateKey);
    this.setState({
      address,
      privateKey: signInPrivateKey,
      signInPrivateKey: '',
    }, () => {
      this.prepareKey(signInPrivateKey);
    });
  };

  renderSignIn() {
    return (
      <div className="cards">
        <Card className="card sign-in-card">
          <Typography variant="title">
            Sign in
          </Typography>
          <p className="tron-power-description">You can sign in with <b>Private Key</b></p>
          <TextField
            label="Private key"
            className="private-key-field"
            value={this.state.signInPrivateKey}
            defaultValue={this.state.signInPrivateKey}
            onChange={this.handleChange('signInPrivateKey')}
            helperText="Please input a valid private key - 64 characters long hex code e.g. D90***AAF."
            margin="normal" />
          <Button 
            className="sign-in-button"
            color="primary"
            variant="raised" 
            disabled={!this.isPrivateKeyValid()}
            onClick={this.signIn}>
            Sign in <LockOpen className="account-details-button-icon"/>
          </Button>
        </Card>
        <h3>or</h3>
        <Card className="card create-account-card">
          <Typography variant="title">
            Create account
          </Typography>
          <p className="tron-power-description">You can create a new <b>Private Key</b> for your account</p>
          <Button 
            className="sign-in-button"
            color="primary"
            variant="raised" 
            onClick={this.createAccount}>
            Create account <AccountBalanceWallet className="account-details-button-icon"/>
          </Button>
        </Card>
      </div>
    )
  }

  renderBackupPrivateKey() {
    return (
      <Dialog
          open={this.state.backupPrivateKeyOpen}
          TransitionComponent={Transition}
          keepMounted
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description" >
        <DialogTitle id="alert-dialog-slide-title">
          Backup private key
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <span className="private-key-warrning">Please write down your private key, we can't restore your private key.</span>
            <br/>
            <br/>
            <span className="private-key">{this.state.privateKey}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleBackupPrivateKeyClose} color="primary">
            I have written down the private key
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderTransactionsTable() {
    const { transactions } = this.state;
    if (!transactions || transactions.length === 0) {
      return (
        <p>No transactions found!</p>
      );
    }

    return (
      <div>
      <Table className="transactions-table">
        <TableHead>
          <TableRow>
            <TableCell className="transactions-time-hash">Time/Hash</TableCell>
            <TableCell className="transactions-addresses">To</TableCell>
            <TableCell className="transactions-amount" numeric>Amount</TableCell>
            <TableCell className="transactions-token">Token</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map(transaction => {
            let amount = transaction.amount;
            if (transaction.tokenName === 'TRX') {
              amount = amount / ONE_TRX;
            }
            return (
              <TableRow key={transaction.transactionHash}>
                <TableCell className="transactions-time-hash" component="th" scope="row">
                  {moment(transaction.timestamp).format('MMMM Do, h:mm:ss a')}
                  <br/><br/>
                  {transaction.transactionHash.substr(0, 20)}...
                </TableCell>
                <TableCell className="transactions-addresses">
                  {transaction.transferFromAddress.substr(0, 14)}...
                  <br/>
                  to
                  <br/>
                  {transaction.transferToAddress.substr(0, 14)}...
                </TableCell>
                <TableCell className="transactions-amount" numeric>{amount}</TableCell>
                <TableCell className="transactions-token">{transaction.tokenName}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="view-transactions-on-tronscan-button">
        <Button size="small" color="primary" onClick={this.goToTronscan}>
          View transactions on tronscan
        </Button>
      </div>
      </div>
    )
  }

  renderTransactions() {
    const { transactions, account } = this.state;
    if (typeof transactions === 'undefined' || typeof account === 'undefined') {
      return null;
    }
    return (
      <Card className="card transactions-card">
        <Typography variant="title">
          Transactions
        </Typography>
          {this.renderTransactionsTable()}
      </Card>
    )
  }

  handleTokenCreateChange = name => event => {
    let tokenCreate = this.state.tokenCreate;
    tokenCreate[name] = event.target.value;
    this.setState({
      tokenCreate
    });
  };

  handleTokenCreateStartDateChange = datetime => {
    let tokenCreate = this.state.tokenCreate;
    tokenCreate.startTime = datetime;
    this.setState({
      tokenCreate
    });
  };

  handleTokenCreateEndDateChange = datetime => {
    let tokenCreate = this.state.tokenCreate;
    tokenCreate.endTime = datetime;
    this.setState({
      tokenCreate
    });
  };

  showTokenCreate = () => {
    this.setState({ tokenCreateOpen: true });
  };

  handleTokenCreateClose = () => {
    this.setState({ tokenCreateOpen: false });
  };

  loadTokenCreate = async () => {
    this.setTokenOnSaleTime();
    this.loadIssuedToken();
  };

  loadIssuedToken = async () => {
    const { address } = this.state;
    if (address) {
      const token = await client.getIssuedAsset(address);
      console.log(token);
      if (token.token) {
        this.setState({
          issuedToken: token,
        });
      }
    }
  };

  setTokenOnSaleTime = async () => {
    const block = await client.getLatestBlock();
    const startTime = moment(block.timestamp).add(1, 'days').toDate();
    const minimumTime = moment(block.timestamp).add(1, 'hours').toDate();
    let endTime = new Date();
    endTime.setHours(0, 0, 0, 0);
    endTime.setDate(startTime.getDate() + 90);

    const {tokenCreate} = this.state;
    tokenCreate.startTime = startTime;
    tokenCreate.endTime = endTime;
    tokenCreate.minimumTime = minimumTime;
    
    this.setState({
      tokenCreate
    });
  };

  isValidStartTime = (datetime) => {
    let date = this.state.tokenCreate.minimumTime;
    date.setHours(0, 0, 0, 0);
    return datetime.isSameOrAfter(date);
  };

  isValidEndTime = (datetime) => {
    return this.state.tokenCreate.startTime && datetime.isAfter(this.state.tokenCreate.startTime);
  };

  isCreateTokenValid() {
    const { tokenCreate } = this.state;
    let error;

    if (!tokenCreate.tokenName || tokenCreate.tokenName.length === 0) {
      error = 'Must have a token name!';
    } else if (tokenCreate.tokenName.length > 32) {
      error = 'Token name can not be longer then 32 characters!';
    } else if (!/^[a-zA-Z]+$/i.test(tokenCreate.tokenName)) {
      error = 'Token name can only contain a-Z characters';
    }

    if (!tokenCreate.tokenAbbreviation || tokenCreate.tokenAbbreviation.length === 0) {
      error = 'Must have a token abbreviation';
    } else if (tokenCreate.tokenAbbreviation.length > 5) {
      error = 'Token abbreviation can not be longer then 5 characters';
    } else if (!/^[a-zA-Z]+$/i.test(tokenCreate.tokenAbbreviation)) {
      error = 'Token abbreviation can only contain a-Z characters';
    }

    if (!tokenCreate.description || tokenCreate.description.length === 0) {
      error = 'Must have a token description';
    } else if (tokenCreate.description.length > 200) {
      error = 'Token description can not be longer then 200 characters';
    }

    if (tokenCreate.totalSupply <= 0) {
      error = 'Total supply must be a positive number';
    }

    if (tokenCreate.website.length === 0) {
      error = 'Must have website URL';
    }

    if (tokenCreate.trxAmount <= 0) {
      error = 'TRX amount must be a positive number';
    }

    if (tokenCreate.tokenAmount <= 0) {
      error = 'Token amount must be a positive number';
    }

    if (new Date(tokenCreate.startTime).getTime() < Date.now()) {
      error = 'Start time can not be in the past';
    }

    if (error) {
      this.setState({
        snackbarOpen: true,
        snackbarMessage: error
      });

      return false;
    }

    return true;
  }

  createToken = async () => {
    const { tokenCreate, address, privateKey } = this.state;
    if (!this.isCreateTokenValid()) {
      return;
    }

    this.setState({ isLoading: true });
    
    const createTokenResult = await client.createToken({
      address,
      name: tokenCreate.tokenName.trim(),
      shortName: tokenCreate.tokenAbbreviation.trim(),
      totalSupply: tokenCreate.totalSupply,
      num: tokenCreate.tokenAmount,
      trxNum: tokenCreate.trxAmount * ONE_TRX,
      startTime: tokenCreate.startTime,
      endTime: tokenCreate.endTime,
      description: tokenCreate.description,
      url: tokenCreate.website,
      frozenSupply: filter(tokenCreate.frozenSupply, fs => fs.amount > 0),
    })(privateKey);
    console.log(createTokenResult);
    if (createTokenResult.success) {
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: 'Succesfully create token!',
        tokenCreate: defaultTokenCreate,
        tokenCreateOpen: false,
      }, () => {
        this.loadAccount();
        this.loadTokenCreate();
        this.loadTransactions();
        setTimeout(()=> {
          this.loadAccount();
          this.loadTokenCreate();
          this.loadTransactions();
        }, 1000)
        setTimeout(()=> {
          this.loadAccount();
          this.loadTokenCreate();
          this.loadTransactions();
        }, 5000)
        setTimeout(()=> {
          this.loadAccount();
          this.loadTokenCreate();
          this.loadTransactions();
        }, 10000)
      });
    } else {
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: `Create token failed, ${createTokenResult.message}, please retry later.`,
      });
    }
  };

  renderTokenCreateCard() {
    const tokenBalance = Math.round(this.state.account.balances[0].balance);
    const enoughTrx = (tokenBalance >= CREATE_TOKEN_COST);
    const { tokenCreate } = this.state;
    return (
      <div>
        <h3 className="issue-token-title">Issue a new Token</h3>
        { !enoughTrx && <p className="not-enough-trx-message">You don't have enough TRX to create token. You need to have at least {CREATE_TOKEN_COST} TRX to create token.</p> }
        { enoughTrx && <div className="create-token-container">
        <TextField
          required
          label="Token name"
          value={tokenCreate.tokenName}
          onChange={this.handleTokenCreateChange('tokenName') }
          margin="normal" />
        <TextField
          required
          label="Token abbreviation"
          value={tokenCreate.tokenAbbreviation}
          onChange={this.handleTokenCreateChange('tokenAbbreviation') }
          margin="normal" />
        <TextField
          required
          label="Total supply"
          value={tokenCreate.totalSupply}
          onChange={this.handleTokenCreateChange('totalSupply') }
          margin="normal" 
          type="number"
          />
        <TextField
          required
          label="Description"
          value={tokenCreate.description}
          onChange={this.handleTokenCreateChange('description') }
          margin="normal" 
          />  
        <TextField
          required
          label="Website"
          value={tokenCreate.website}
          onChange={this.handleTokenCreateChange('website') }
          margin="normal" 
          />
        <h4>Token price</h4>
        <TextField
          required
          label="TRX amount"
          value={tokenCreate.trxAmount}
          onChange={this.handleTokenCreateChange('trxAmount') }
          margin="normal" 
          type="number"
          />
        <TextField
          required
          label="Token amount"
          value={tokenCreate.tokenAmount}
          onChange={this.handleTokenCreateChange('tokenAmount') }
          margin="normal" 
          type="number"
          />   
        <p className="token-price-description">Participants will receive {tokenCreate.tokenAmount / tokenCreate.trxAmount} {tokenCreate.tokenName} Token for every 1 TRX.</p>
        <p className="token-price-description">Token price: 1 Token = {tokenCreate.trxAmount / tokenCreate.tokenAmount} TRX.</p>
        <h4>Frozen Supply</h4>
        <p className="token-price-description">You can freeze a part of supply for {tokenCreate.tokenName} token. You can specify the amount to be frozen for a minimum of 1 day. You can manually unfreeze after start date + frozen days has been reached. Freezing supply is optional.</p>
        <TextField
          label="Frozen amount"
          value={this.state.tokenCreate.frozenAmount}
          onChange={this.handleTokenCreateChange('frozenAmount') }
          margin="normal" 
          type="number"
          />
        <TextField
          label="Frozen days"
          value={this.state.tokenCreate.frozenDays}
          onChange={this.handleTokenCreateChange('frozenDays') }
          margin="normal" 
          type="number"
          />
        <h4>Participation period </h4>
          <div>
            <h5>Start date</h5>
            <DateTimePicker
              onChange={(data) => this.handleTokenCreateStartDateChange(data.toDate()) }
              isValidDate={this.isValidStartTime}
              value={this.state.tokenCreate.startTime}
              input={false}/>
          </div>
          <div>
            <h5>End date</h5>
            <DateTimePicker
              onChange={(data) => this.handleTokenCreateEndDateChange(data.toDate()) }
              isValidDate={this.isValidEndTime}
              value={this.state.tokenCreate.endTime}
              input={false}/>
          </div>  
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.createTokenConfirm}
              onChange={this.handleCheckboxChange('createTokenConfirm')}
              value="createTokenConfirm"
              color="primary"
            />
          }
          label="I confirm to use 1024 TRX to create the new token"
          disabled={this.state.isLoading}
        />
        <Button 
          id="freeze-token-button"
          className="send-token-button" 
          variant="raised" 
          color="primary" 
          disabled={!this.state.createTokenConfirm || this.state.isLoading}
          onClick={this.createToken}>
          Create Token <AddCircle className="send-button-icon"/>
        </Button>
        </div>
        }
      </div>
    )
  }

  renderTokenCreate() {
    if (!this.state.account) {
      return null;
    }
    const { issuedToken } = this.state;

    return (
      <Dialog
          fullScreen
          open={this.state.tokenCreateOpen}
          onClose={this.handleTokenCreateClose}
          TransitionComponent={Transition} >
          <AppBar position="static" className="appBar">
            <Toolbar>
              <Tooltip title="Close">
                <IconButton color="inherit" onClick={this.handleTokenCreateClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="title" color="inherit">
                Create Token
              </Typography>
            </Toolbar>
          </AppBar>
          <div>
          <Card className="card">
            { issuedToken && <p>You can only create one token per account!</p>}
            { !issuedToken && this.renderTokenCreateCard()}
          </Card>
        </div>
      </Dialog>
    )
  }

  showTokenParticipate = () => {
    this.setState({ tokenParticipateOpen: true });
  };

  handleTokenParticipateClose = () => {
    this.setState({ tokenParticipateOpen: false });
  };

  setBuyTokenAmount = (token, amount) => {
    const { buyingTokens, account } = this.state;
    const buyingAmount = amount.replace(/^0+(?!\.|$)/, '').replace(/[^0-9 .]+/g,'').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1");
    const trx = find(account.balances, token => token.name === "TRX");

    if (buyingAmount * token.price / ONE_TRX < trx.balance) {
      buyingTokens[token.name] = buyingAmount;
    } else {
      buyingTokens[token.name] = trx.balance * ONE_TRX / token.price;
    }

    this.setState({
      buyingTokens
    });
  };

  buyToken = async (tokenName) => {
    const { buyingTokens, tokens, privateKey, address } = this.state;
    const token = tokens.find(t => t.name === tokenName)

    this.setState({ isLoading: true });
    
    const participateAssetResult = await client.participateAsset(address, token.ownerAddress, token.name, buyingTokens[tokenName] * token.price)(privateKey);
    if (participateAssetResult.success) {
      buyingTokens[tokenName] = 0;
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: 'Succesfully buy token!',
        buyingTokens
      }, () => {
        this.loadAccount();
        this.loadTransactions();
        this.loadTokens();
        setTimeout(()=> {
          this.loadAccount();
          this.loadTransactions();
          this.loadTokens();
        }, 1000)
        setTimeout(()=> {
          this.loadAccount();
          this.loadTransactions();
          this.loadTokens();
        }, 5000)
        setTimeout(()=> {
          this.loadAccount();
          this.loadTransactions();
          this.loadTokens();
        }, 10000)
      });
    } else {
      this.setState({
        isLoading: false,
        snackbarOpen: true,
        snackbarMessage: `Buy token failed, ${participateAssetResult.message}, please retry later.`,
      });
    }
  };

  isBuyTokenButtonValid = (tokenName) => {
    const { buyingTokens } = this.state;
    return buyingTokens[tokenName] && buyingTokens[tokenName] > 0;
  };

  getBuyingTokenButtonText = (token) => {
    const { buyingTokens } = this.state;

    if (buyingTokens[token.name] && buyingTokens[token.name] > 0) {
      const trxAmount = Number(buyingTokens[token.name] * (token.price / ONE_TRX)).toFixed(3) * 1;
      return `Cost ${trxAmount} TRX to buy`;
    } else {
      return 'Input positive amount to buy';
    }
  }

  renderTokenParticipate() {
    if (!this.state.tokens) {
      return null;
    }

    const now = new Date().getTime();
    const tokens = this.state.tokens.filter( token => token.startTime < now && token.endTime > now && token.percentage < 100 );
    const { buyingTokens } = this.state;

    return (
      <Dialog
          fullScreen
          open={this.state.tokenParticipateOpen}
          onClose={this.handleTokenParticipateClose}
          TransitionComponent={Transition} >
          <AppBar position="sticky" className="appBar">
            <Toolbar>
              <Tooltip title="Close">
                <IconButton color="inherit" onClick={this.handleTokenParticipateClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="title" color="inherit">
                Buy Token
              </Typography>
            </Toolbar>
          </AppBar>
          <div className="buy-token-container">
          {
          tokens.map((token, index) => (
            <Card key={index + "-" + token.name} className="card buy-token-card">
              <h3>{token.name}</h3>
              <div className="buy-token-desription">{token.description}</div>
              <div className="progress-desription">
                <div>Sold: <span className="progress-sold">{token.issued}</span> / Total: <span className="progress-total">{token.availableSupply}</span></div>
                <div className="progress-sold">{Math.ceil(token.issuedPercentage)}% </div>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{width: token.issuedPercentage + '%'}}/>
              </div>
              <div className="progress-ends">
                ends in {moment(token.endTime).diff(moment(), 'days')} days
              </div>
              <div className="buy-rate">1 TRX = {ONE_TRX / token.price} {token.name}.</div>
              <div className="buy-message">How much tokens do you want to buy?</div>
              <TextField
                  required
                  label="Amount"
                  className="buy-amount"
                  value={buyingTokens[token.name]}
                  onChange={(ev) => this.setBuyTokenAmount(token, ev.target.value) }
                  margin="normal" 
                  type="number"
                  placeholder="0"
                  disabled={this.state.isLoading} />
              <Button variant="outlined" className="buy-button" color="primary"
                  onClick={() => this.buyToken(token.name)}
                  disabled={!this.isBuyTokenButtonValid(token.name) || this.state.isLoading}>
                  {this.getBuyingTokenButtonText(token)}
              </Button>
            </Card>
          ))
          }
          
        </div>
      </Dialog>
    )
  }

  renderTokensTable() {
    const { account, tokenCreate } = this.state;
    if (!account || account.balances.length < 2) {
      return (
        <div>
          <p>No tokens found!</p>
          <div className="token-buttons no-token">
            <Button variant="outlined" onClick={this.showTokenCreate}
             disabled={!tokenCreate.startTime}>
              Create <AddCircle className="account-details-button-icon"/>
            </Button>
            <Button variant="outlined" onClick={this.showTokenParticipate}>
            Buy <MonetizationOn className="account-details-button-icon"/>
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="tokens-table-container">
        <Table className="tokens-table">
          <TableHead>
            <TableRow>
              <TableCell className="tokens-name">Token</TableCell>
              <TableCell className="tokens-amount" numeric>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {account.balances.map((token, index) => {
              return (
                (index > 0) &&
                <TableRow key={index}>
                  <TableCell className="tokens-name">{token.name}</TableCell>
                  <TableCell className="tokens-amount" numeric>{token.balance}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="token-buttons">
          <Button variant="outlined" onClick={this.showTokenCreate}
             disabled={!tokenCreate.startTime}>
            Create <AddCircle className="account-details-button-icon"/>
          </Button>
          <Button variant="outlined" onClick={this.showTokenParticipate}>
          Buy <MonetizationOn className="account-details-button-icon"/>
          </Button>
        </div>
        <div className="view-transactions-on-tronscan-button">
          <Button size="small" color="primary" onClick={this.goToTronscanTokens}>
            View tokens on tronscan
          </Button>  
        </div>
      </div>
    )
  }

  renderTokens() {
    const { account } = this.state;
    if (!account) {
      return null;
    }
    
    return (
      <Card className="card tokens-card">
        <Typography variant="title">
          Tokens
        </Typography>
          {this.renderTokensTable()}
      </Card>
    )
  }

  renderWallet() {
    return (
      <div className="cards">
        {this.renderTron()}
        {this.renderSendReceiveButtons()}
        {this.renderTransactions()}
        {this.renderTokens()}
        {this.renderTronPower()}
        {this.renderVotesCard()}

        {this.renderAccountDetails()}
        {this.renderReceive()}
        {this.renderSend()}
        {this.renderFreeze()}
        {this.renderUnfreeze()}
        {this.renderVotes()}
        {this.renderBackupPrivateKey()}
        {this.renderTokenCreate()}
        {this.renderTokenParticipate()}
        {this.renderSnackbar()}
      </div>
    )
  }

  renderWalletOrSignIn() {
    if (this.state.privateKey) {
      return this.renderWallet();
    } else {
      return this.renderSignIn();
    }
  }
  
  signOut = () => {
    this.clear();
  }

  renderAppBar() {
    return (
      <AppBar position="sticky">
        <Toolbar>
          <div className="tool-bar">
            <div className="logo-container">
              <img src={logo} className="app-logo" alt="logo" />
              <Typography variant="title" color="inherit">
                Tron Wallet
              </Typography>
            </div>
            <div>
              { this.state.privateKey && <Button 
                className="sign-out-button" 
                color="inherit" 
                onClick={this.signOut}>
                Sign Out
              </Button> }
            </div>
          </div>
        </Toolbar>
      </AppBar>
    )
  }

  render() {
    return (
      <div className="App">
        {this.renderAppBar()}
        {this.renderWalletOrSignIn()}
      </div>
    );
  }
}

export default App;
