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
        description: ''
    })

    const captureFile = (e) => {

        e.preventDefault()
        const file = e.target.files[0]
        const urlObj = URL.createObjectURL(file)
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)

        reader.onloadend = () => {
            setImageState({
                ...imageState,
                imageFile: urlObj,
                imageBuffer: Buffer(reader.result),
            })
        }
    }

    const uploadImage = () => {
        console.log("Submitting file to ipfs...")

        //adding file to the IPFS
        ipfs.add(imageState.imageBuffer).then((response) => {
            console.log('Ipfs result', response)
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
        })
    }

    return (
        <div className="col-lg-12 ml-auto mr-auto" style={{ width: '500px' }}>
            <div className="content mr-auto ml-auto">
                <form onSubmit={(e) => {
                    e.preventDefault()
                    uploadImage()
                }}>
                    <h2 className="mb-4">Share Image</h2>
                    {imageState.imageFile ? (
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
                    ) : (
                        <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={captureFile} />
                    )}
                    <div className="form-group mr-sm-2">
                        <input
                            id="imageDescription"
                            type="text"
                            className="form-control my-2 mt-4"
                            placeholder="Image description..."
                            required
                            value={imageState.description}
                            onChange={e => setImageState({
                                ...imageState,
                                description: e.target.value
                            })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block w-100">Upload!</button>
                </form>
            </div>
        </div>
    )
}

export default ImageForm
