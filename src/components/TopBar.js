import React, {useEffect, useState, useMemo, createContext} from 'react';
import { Button, Tabs, Tab, Container, Nav, Navbar, Form, Modal, ModalDialog } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Web3 from 'web3';
import '../App.css';

const TopBar = ({wallet}) => {

  const [currentAccount, setAccount] = useState();
  const [currentAccountBalance, setAccountBalance] = useState();
  

  const loadWeb3 = async() => {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
    }
    else if(window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Please install metamask')
    }
  }

  const loadWalletData = async() => {
    const web3 = window.web3
    const account = await web3.eth.getAccounts();
    setAccount(account[0]);
    let _balance = await web3.eth.getBalance(currentAccount)
    //convert balance from wei to ether
    let balance = await web3.utils.fromWei(_balance, "ether");
    setAccountBalance(balance);
  }

  useEffect(() => {
    //setup to connect to Metamask wallet or other wallet provider
    loadWeb3();
    //by calling getAccounts, we will know if we are connected to metamask
    loadWalletData();
  })

    return (
      <>
        <div className="App.header">
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand>Wallet Address: {currentAccount}</Navbar.Brand>
            <Navbar.Brand>Wallet ETH Balance: {currentAccountBalance}</Navbar.Brand>
          </Container>
        </Navbar>
        </div>
        
      </>
    )
}

export default TopBar;