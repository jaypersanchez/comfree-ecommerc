import React, {useEffect, useState, useMemo} from 'react';
import { Button, Tabs, Tab, Container, Nav, Navbar, Form, Modal, ModalDialog } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { Alert, ImageListItemBar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { itemData } from './common'
import Web3 from 'web3';
import ComfreeABI from '../abi/ComfreeProtocol.json'


const PropertyList = () => {
    //console.log(`Homes ${itemData[0].img}`)
    const [comfreeaddress, setcomfreeaddress] = useState("0x02416fB9e00F5E5F47A3ca08C6127379c5beAA3B")
    const [currentAccount, setAccount] = useState();
    const [currentAccountBalance, setAccountBalance] = useState();
    const [datarowsloading,setdatarowsloading] = useState(false);
    const [datarows, setdatarows] = useState([])
    const [propertyaddress,setPropertyAddress] = useState();
    const [costineth,setCostInEth] = useState();
    const [imgurl, setImgUrl] = useState();
    const [selleraddress, setSellerAddress] = useState();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    /** Offer Properties */
    const [offerpropertyid, setOfferPropertyId] = useState();
    //buyer address is in currentAccount
    //use current selleraddress already defined
    const [offeramount, setOfferAmount] = useState();
    const [offeraccepted, setOfferAccepted] = useState(false);
    const [numberofoffers, setNumberOfOffers] = useState();
  

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

  const getPropertiesForSale = async() => {
    var web3 = new Web3(Web3.givenProvider);
    let counter = 0
    var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
    _comfreeInstance.methods.getArticlesForSale().call()
  }

  const getNumberOfOffers = async() => {
    var web3 = new Web3(Web3.givenProvider);
    var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
    _comfreeInstance.methods.getOfferContractDetailsById().call()
    .then(numOffers => {
      setNumberOfOffers(numOffers)
    })
  }

  const getListOfOffers = async() => {
    var web3 = new Web3(Web3.givenProvider);
    var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
    for(let i=0; i<=numberofoffers; i++) {
      _comfreeInstance.methods._listOfOfferContracts(i).call()
      .then( list => {
          //console.log(`Offers ${JSON.stringify(list)}`)
          console.log(`Offer: ${list.id}::${list.propertyid}::${list.sellerAddress}::${list.buyerAddress}::${list.offerAmount}::${list.accped}`)
      })
    }
  }

  const addProperty = async() => {
    var web3 = new Web3(Web3.givenProvider);
    var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
    _comfreeInstance.methods.addPropertyForSale('0x0000000000000000000000000000000000000000', currentAccount, imgurl, propertyaddress, costineth).send({from: currentAccount})
    .then( results => {
        //console.log(JSON.stringify(results))
        setImgUrl("");
        setPropertyAddress("");
        setCostInEth("");
        /*console.log(`add article ${JSON.parse(results.returnValues._id)} ${JSON.parse(results.returnValues._name)}`)*/
    })
  }

  const submitOffer = async() => {
    //console.log(`Offer Info ${selleraddress} ${currentAccount} ${offerpropertyid} ${offeramount} ${offeraccepted}`)
    var web3 = new Web3(Web3.givenProvider);
    var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
    _comfreeInstance.methods.createOfferContract(offerpropertyid, currentAccount, selleraddress,  offeramount, offeraccepted).send({from: currentAccount})
    .then(results => {
        console.log(JSON.stringify(results))
    })
    .then(setShow(false))
  }

  useEffect(() => {
    //setup to connect to Metamask wallet or other wallet provider
    loadWeb3();
    //by calling getAccounts, we will know if we are connected to metamask
    loadWalletData();
  })

  useMemo(() => {
    var web3 = new Web3(Web3.givenProvider);
    let counter = 0
    var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
    _comfreeInstance.methods.getHomesForSale().call()
    .then(properties => {
        properties.forEach(element => {
          //get article by the id
          _comfreeInstance.methods._homesForSale(element).call()
          .then(house => {
              //console.log(`House ${house.toString()}`)
              setdatarowsloading(true);
                //console.log(`{id: ${house[0]}, imgurl: ${house[3]}`);
                setdatarows(datarows => [...datarows, {id: house[0], seller: house[1], buyer:  house[2], imgurl: house[3], propertyaddress: house[4], ethprice: house[5]} ])
          })
        });
        setdatarowsloading(false); 
      })
      getNumberOfOffers();
      getListOfOffers();
  },[])

    return(
        <>
            <div>
                Properties for Sale - <p className="fw-bold">Click Anywhere on the image to make an offer</p>
            </div>
            <div>
                <ImageList rowHeight={160} cols={3}>
                    {
                        datarows.map((item) => (
                            <ImageListItem key={item.id}>
                                <img src={item.imgurl} 
                                    onClick={
                                        (e) => { 
                                            //console.log(`seller address ${item.seller}`)
                                            if(item.seller === currentAccount) {
                                                //console.log(`buyser same as seller`)
                                                window.alert(`You are the seller for this house`)
                                            }
                                            else {
                                                setOfferPropertyId(item.id);
                                                setSellerAddress(item.seller)
                                                setShow(true);
                                            }
                                        }
                                    } />
                                <ImageListItemBar
                                    title={item.propertyaddress}
                                    subtitle={`Price in ETH ${item.ethprice}`}
                                    actionIcon={
                                        <IconButton
                                          sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                          aria-label={`info about ${item.seller}`}
                                        >
                                          <InfoIcon onClick={() => {navigator.clipboard.writeText(item.seller)}}/>
                                        </IconButton>
                                      }
                                />
                            </ImageListItem>
                        ))
                    }
                </ImageList>
                    <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Make an Offer</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                            <Form.Group className='mb-3' id="balance">
                                <Form.Control placeholder='Enter Amount of ETH to purchase' onChange={
                                    (e) => {setOfferAmount(e.target.value)}
                                }/>
                            </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                            <Button variant="secondary" onClick={(e) => submitOffer(e)}>Submit Offer</Button>
                                <Button variant="secondary" onClick={handleClose}>Close</Button>
                            </Modal.Footer>
                    </Modal>
            </div>
            <div>
            <Tabs
                defaultActiveKey="AddProperty"
                id="uncontrolled-tab-example"
                className="mb-3"
            >
                <Tab eventKey="AddProperty" title="Add Property to Sell">
                    <Form.Group className='mb-3' id="property">
                        <Form.Control placeholder='Property Address' onChange={(e) => {setPropertyAddress(e.target.value)}}/>
                        <Form.Control placeholder='Cost in ETH' onChange={(e) => {setCostInEth(e.target.value)}}/>
                        <Form.Control placeholder='Link to Property Image' onChange={(e) => {setImgUrl(e.target.value)}}/>
                    </Form.Group>
                    <div>
                    <Button variant="secondary" onClick={(e) => addProperty(e)}>List Property</Button>
                    </div>
                </Tab>
                <Tab eventKey="CreateOffer" title="Manage Offer Purchase - Escrow">
                     
                </Tab>
            </Tabs>
            </div>
        </>
    );

    

}

export default PropertyList;