import React, { useEffect, useState, useMemo } from 'react';
import { Button, Tabs, Tab, Container, Nav, Navbar, Form, Modal } from 'react-bootstrap'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem'
import { Alert, ImageListItemBar, unstable_createMuiStrictModeTheme } from '@mui/material' 
import ComfreeABI from './comfreeabi.json'
import Web3 from 'web3';
import '../App.css'

const PropertyList = () => {
    const [currentAccount, setAccount] = useState();
    const [currentAccountBalance, setAccountBalance] =  useState();
    const [comfreeaddress, setcomfreeaddress] = useState("0x92822C4895e4b0C63cFF8530E309c0eF12fF5B14");
    const [datarowsloading, setdatarowsloading] = useState(false);
    const [propertyaddress, setPropertyAddress] = useState()
    const [costineth, setCostInEth] = useState();
    const [offerpropertyid, setOfferPropertyId] = useState()
    const [selleraddress, setSellerAddress] = useState()
    const [imgurl, setImgUrl] = useState()
    const [datarows, setdatarows] = useState([])
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false)
    const handlShow = () => setShow(true)
    const [offeramount, setOfferAmount] = useState()
    const [offeraccepted, setOfferAccepted] = useState(false);
    const [offerdatarowsloading, setofferdatarowsloading] = useState(false)
    const [offersdatarows, setoffersdatarows] = useState([])

    const loadWeb3 = async() => {
        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
        }
        else if(window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            window.alert("Please install metamask")
        }
    }

    const loadWalletData = async() => {
        const web3 = window.web3;
        const account = await web3.eth.getAccounts();
        setAccount(account[0]);
        let _balance = await web3.eth.getBalance(currentAccount);
        let balance = await web3.utils.fromWei(_balance, "ether")
        setAccountBalance(balance);
    }

    useEffect(() => {
        loadWeb3();
        loadWalletData();
    })

    //list properties for sale
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
                  console.log(`House ${house.toString()}`)
                  setdatarowsloading(true);
                    console.log(`{id: ${house[0]}, imgurl: ${house[3]}`);
                    setdatarows(datarows => [...datarows, {id: house[0], seller:house[1], buyer:house[2], imgurl: house[3], propertyaddress:house[4], ethprice:house[5]}])
                })
            });
            setdatarowsloading(false); 
          })
      },[])

      const addProperty = async() => {
        var web3 = new Web3(Web3.givenProvider);
        var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
        _comfreeInstance.methods.addPropertyForSale('0x0000000000000000000000000000000000000000', currentAccount, imgurl, propertyaddress, costineth).send({from: currentAccount})
        .then( results => {
            console.log(JSON.stringify(results))
            setImgUrl("");
            setPropertyAddress("");
            setCostInEth("");
            /*console.log(`add article ${JSON.parse(results.returnValues._id)} ${JSON.parse(results.returnValues._name)}`)*/
        })
      }

      const submitOffer = async(e) => {
        console.log(offerpropertyid, currentAccount, selleraddress, imgurl, offeramount, offeraccepted)
        var web3 = new Web3(Web3.givenProvider);
        var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
        _comfreeInstance.methods.createOfferContract(offerpropertyid, currentAccount, selleraddress, imgurl, offeramount, offeraccepted)
        .send({from:currentAccount})
        .then(results => {
            console.log(JSON.stringify(results))
        })
        .then(setShow(true))
      }

      //list properties with offers
      useMemo(() => {
        var web3 = new Web3(Web3.givenProvider);
        var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
        _comfreeInstance.methods.getOfferContractDetailsById().call()
        .then(properties => {
            properties.forEach(element => {
                _comfreeInstance.methods._listOfOfferContracts(element).call()
                .then((house, element) => {
                    setofferdatarowsloading(true);
                    console.log(`offer ${house[0]}::${house[1]}::${house[2]}::${house[3]}}}`)
                    setoffersdatarows(offersdatarows => [...offersdatarows, {id:house[0], propertyid:house[1],buyer:house[2],seller:house[3],imgurl:house[4],offer:house[5],
                    accept:house[6]}])
                })
                setofferdatarowsloading(false)
            })
        })
      },[])

      const  acceptOffer = async(id, accepted, propertyid, acceptedamount) => {
        var web3 = new Web3(Web3.givenProvider);
        var _comfreeInstance = new web3.eth.Contract(ComfreeABI, comfreeaddress)
        _comfreeInstance.methods.accept(id, accepted, propertyid)
        .send({
            from:currentAccount,
            value: web3.utils.toWei(acceptedamount),
            gas: "2100000"
        })
        .then(result => {
            console.log(JSON.stringify(result))
        })
      }

    return(
        <>
            <div>
                <Tabs
                    defaultActiveKey="AddProperty"
                    id="uncontrolled-tab-example"
                    className='mb-3'
                >
                    <Tab eventKey="AddProperty" title="Add Property to Sell">
                        <Form.Group className='mb-3' id="property">
                            <Form.Control placeholder='Property Address' onChange={(e) => {setPropertyAddress(e.target.value)}}/>
                            <Form.Control placeholder='Cost ETH' onChange={(e) => {setCostInEth(e.target.value)}}/>
                            <Form.Control placeholder='Link to Property Image' onChange={(e) => {setImgUrl(e.target.value)}}/>
                        </Form.Group>
                        <div>
                            <Button variant='primary' onClick={(e) => addProperty(e)}>List Property</Button>
                        </div>
                        <div>
                            <ImageList rowHeight={160} cols={3}>
                                {
                                    datarows.map((item) => (
                                        <ImageListItem key={item.id}>
                                            <img src={item.imgurl} 
                                                onClick={
                                                    (e) => {
                                                        if(item.seller === currentAccount) {
                                                            window.alert(`You are the seller for this house`)
                                                        }
                                                        else {
                                                            setOfferPropertyId(item.id);
                                                            setSellerAddress(item.seller)
                                                            setImgUrl(item.imgurl)
                                                            setShow(true)
                                                        }
                                                    }
                                                }
                                            />
                                            <ImageListItemBar 
                                                title={item.propertyaddress}
                                                subtitle={`Price In ETH ${item.ethprice}`}
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
                                        <Form.Control placeholder='Enter Amount of ETH to purchase' onChange={(e) => setOfferAmount(e.target.value)} />
                                    </Form.Group>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant='secondary' onClick={(e) => submitOffer(e)}>Submit Offer</Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </Tab>
                    <Tab eventKey="CreateOffer" title="Homes with Offers">
                            <div>
                                <ImageList rowHeigh={160} cols={3}>
                                    {
                                        offersdatarows.map((item) => (
                                            <ImageListItem key={item.id}>
                                                <img src={item.imgurl} 
                                                    onClick={
                                                        (e) => {
                                                            console.log(`ACCEPT OFFER::${item.id}::${item.propertyid}::${item.accept}`)
                                                            if(item.accept === false) {
                                                                acceptOffer(item.id, true, item.propertyid, item.offer)
                                                            }
                                                            else {
                                                                window.alert(`Offer has been accepted and is off the market`)
                                                            }
                                                        }
                                                    }
                                                />
                                                <ImageListItemBar 
                                                    title={`Offer ID ${item.id}`}
                                                    subtitle={`Amount Offered ${item.offer}`}
                                                />
                                            </ImageListItem>
                                        ))
                                    }
                                </ImageList>
                            </div>
                    </Tab>
                </Tabs>
            </div>
        </>
    )

}

export default PropertyList