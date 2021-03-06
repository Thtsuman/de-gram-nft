import React from 'react'
import Web3 from 'web3'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container } from 'react-bootstrap'
import Degram from './abis/Degram.json'
import ImageForm from './components/ImageForm/ImageForm';
import Identicon from 'react-identicons';

const App = () => {
  const [account, setAccount] = React.useState(null);
  const [degramContract, setDegramContract] = React.useState(false)
  const [images, setImages] = React.useState([])
  const [totalImageCount, setTotalImageCount] = React.useState(0)
  const [loadingState, setLoadingState] = React.useState('initializing')

  React.useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  React.useEffect(() => {
    if (degramContract) {
      getImagesFromBlockchain()
    }
  }, [degramContract])

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-ethereum browser detected. You should consider trying Metamask!')
    }
  }

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])

    // network id
    const networkId = await web3.eth.net.getId();
    // it will detect networkId of your 
    // deployed contract from the abi itself
    const networkData = Degram.networks[networkId];

    if (networkData) {
      // create contract
      /*
        here replace the abi
        with your own abi
        imported
      */
      const degram = new web3.eth.Contract(Degram.abi, networkData.address)
      // or you can add address manually
      // const degram = new web3.eth.Contract(Degram.abi, '0x11f9977F6EE919458539ba6EDC5980Da43Fb795D')
      setDegramContract(degram)
    } else {
      window.alert('Degram contract is not deployed in detected network')
    }
  }

  const getImagesFromBlockchain = async () => {
    setLoadingState('loading...')
    if (degramContract) {
      const imageCount = await degramContract.methods.imageCount().call();
      setTotalImageCount(imageCount)

      // load images
      let images = [];
      for (var i = 1; i <= imageCount; i++) {
        const image = await degramContract.methods.images(i).call()
        images = [...images, image]
      }

      setImages(images)

      setLoadingState('loaded')
    }
  }

  const uploadImageToBlockChain = (formState) => {
    // you will get all the values
    // on the form in the "formState" variable
    console.log(formState)

    /*
      call your contract instead of uploadImage function below
    */

    const { imgHash, imgDescription } = formState;

    setLoadingState('uploading-image')

    degramContract.methods.uploadImage(imgHash, imgDescription)
      .send({ from: account })
      .on('transactionHash', (hash) => {
        setLoadingState('loaded')
        getImagesFromBlockchain()
      })
  }

  const tipImageOwner = (imageId, tipAmount) => {
    degramContract.methods.tipImageOwner(imageId)
      .send({ from: account, value: tipAmount })
      .on('transactionHash', (hash) => {
        getImagesFromBlockchain()
        setLoadingState('loaded')
      })
  }

  const renderApplication = () => {
    switch (loadingState) {
      case 'initializing':
        return 'Initializing';
      case 'loaded':
        return <ImageForm uploadImageToBlockChain={uploadImageToBlockChain} />
      default:
        return loadingState;
    }
  }

  return (
    <div className="App">
      <Navbar bg="dark" variant='dark' expand="lg">
        <Container fluid>
          <Navbar.Brand href="#">Degram</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
            >
              <Nav.Link href="#">Home</Nav.Link>
              <Nav.Link href="#">Link</Nav.Link>
            </Nav>
            <div className="d-flex">
              <span className="badge bg-success">{account}</span>
              <Identicon className="custom-identicon" string={account} />
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="px-auto my-3 d-flex flex-column align-items-center justify-content-center">
        <div>
          {renderApplication()}
          <div className="container">
            {images?.map((image, key) => {
              return (
                <div className="card my-4" key={key} >
                  <div className="card-header d-flex align-items-center">
                    <Identicon className="custom-identicon" string={image.author} />
                    <small className="badge text-muted">{image.author}</small>
                  </div>
                  <ul id="imageList" className="list-group list-group-flush">
                    <li className="list-group-item">
                      <p class="text-center">
                        <img
                          className="rounded"
                          alt=""
                          src={`https://ipfs.infura.io/ipfs/${image.hash}`}
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      </p>
                      <p>{image.description}</p>
                    </li>
                    <li key={key} className="list-group-item py-2 d-flex align-items-center justify-content-between">
                      <small className="float-left text-muted">
                        TIPS: {window.web3.utils.fromWei(image.tipAmount.toString(), 'Ether')} ETH
                      </small>
                      <button
                        className="btn btn-outline-success btn-sm float-right pt-0"
                        type="button"
                        onClick={() => {
                          let tipAmount = window.web3.utils.toWei('0.1', 'Ether')
                          console.log(image.id, tipAmount)
                          tipImageOwner(image.id, tipAmount)
                        }}
                      >
                        TIP 0.1 ETH
                      </button>
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default App;
