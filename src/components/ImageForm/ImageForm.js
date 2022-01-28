import React from 'react'
import './imageForm.style.scss'

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
// leaving out the arguments will default to these values


const ImageForm = (props) => {
    const { uploadImageToBlockChain } = props

    const [imageState, setImageState] = React.useState({
        imageFile: null,
        imageBuffer: null,
        fileName: "",
        fileExtension: "",
        musicName: '',
        artistName: "",
        genre: ""
    })

    const captureFile = (e) => {
        function getFile(filePath) {
            return filePath.substr(filePath.lastIndexOf('\\') + 1).split('.')[0];
        }

        e.preventDefault()
        const file = e.target.files[0]
        const urlObj = URL.createObjectURL(file)
        const reader = new window.FileReader()
        const fileName = getFile(file.name);
        const extension = file.name?.split('.')[1];
        reader.readAsArrayBuffer(file)  
        

        reader.onloadend = () => {
            
            setImageState({
                ...imageState,
                fileName,
                extension,
                imageFile: urlObj,
                imageBuffer: Buffer(reader.result),
            })
        }
    }

    // uploading to ipfs
    const uploadImage = () => {
        console.log("Submitting file to ipfs...")

        //adding file to the IPFS
        ipfs.add(imageState.imageBuffer).then((response) => {
            console.log('Ipfs result', response)

            // update on contract
            /*
                this function is defined on 
                App.js
            */
            uploadImageToBlockChain({
                imgHash: response.path,
                imgDescription: imageState.description
            })
        }).catch(err => {
            console.error(err)
            return;
        })
    }

    const handleClearImageState = () => {
        setImageState({
            ...imageState,
            imageFile: null,
            imageBuffer: null,
            fileName: "",
            fileExtension: "",
        })
    }

    const handleUpdateFormObj = (e) => {
        e.preventDefault()
        const { id, value } = e.target
        setImageState({
            ...imageState,
            [id]: value
        })
    }

    const renderUploadFileSection = () => {
        if (imageState.imageFile) {
            if(imageState.extension === 'mp3') {
                return (
                    <div className="img-preview">
                      <audio controls="controls" autobuffer="autobuffer">
                        <source src={imageState.imageFile} />
                        <track src="" kind="captions" label="english_captions" />
                    </audio>
                    <div className="image-close-btn" onClick={handleClearImageState}>
                        <i className='bx bx-x'></i>
                    </div>
                </div>
                )
            }
            return (
                <div className="img-preview">
                    <img
                        className="rounded img-wrapper"
                        src={imageState.imageFile}
                        alt=""
                    />
                    <div className="image-close-btn" onClick={handleClearImageState}>
                        <i className='bx bx-x'></i>
                    </div>
                </div>
            )
        } else {
            return (
                <input type='file' onChange={captureFile} />
            )
        }
    }

    return (
        <div className="col-lg-12 ml-auto mr-auto" style={{ width: '500px' }}>
            <div className="content mr-auto ml-auto">
                <form onSubmit={(e) => {
                    e.preventDefault()
                    uploadImage()
                }}>
                    <h2 className="mb-4">Share Image</h2>
                    {renderUploadFileSection()}
                    <div className="form-group mr-sm-2">
                        <input
                            id="musicName"
                            type="text"
                            className="form-control my-2 mt-4"
                            placeholder="Music Name"
                            required
                            value={imageState.musicName}
                            onChange={handleUpdateFormObj}
                        />
                        <input
                            id="artistName"
                            type="text"
                            className="form-control my-2 mt-4"
                            placeholder="Artist Name"
                            required
                            value={imageState.artistName}
                            onChange={handleUpdateFormObj}
                        />
                        <input
                            id="genre"
                            type="text"
                            className="form-control my-2 mt-4"
                            placeholder="genre"
                            required
                            value={imageState.genre}
                            onChange={handleUpdateFormObj}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block w-100">Upload!</button>
                </form>
            </div>
        </div>
    )
}

export default ImageForm
