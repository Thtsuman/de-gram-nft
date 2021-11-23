/* eslint-disable jest/valid-describe */
const { assert } = require('chai');
const Degram = artifacts.require('./Degram.sol');


require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Degram', ([deployer, author, tipper]) => {
    let degram;

    before(async () => {
        degram = await Degram.deployed();
    })

    describe('deployment', async () => {
        it('deploys successfully!', async () => {
            const address = await degram.address

            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await degram.name()

            assert.equal(name, 'Degram')
        })
    })

    describe('images', async () => {
        let result, imageCount;
        const hash = 'abc123';
        const description = 'Image description'

        before(async () => {
            result = await degram.uploadImage(hash, description, { from: author });
            imageCount = await degram.imageCount()
        })

        it('create images', async () => {
            // success 
            assert.equal(imageCount, 1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), imageCount.toNumber(), "[id is correct]");
            assert.equal(event.hash, hash, "[hash is correct]");
            assert.equal(event.description, description, "[description is correct]");
            assert.equal(event.tipAmount, '0', "[tip amount is correct]");
            assert.equal(event.author, author, "[author is correct]");

            // failure 
            await degram.uploadImage('', 'Image description', {from: author}).should.be.rejected;
        }) 

        it('lists images', async () => {
            const image = await degram.images(imageCount)
            assert.equal(image.id.toNumber(), imageCount.toNumber(), "[id is correct]");
            assert.equal(image.hash, hash, "[hash is correct]");
            assert.equal(image.description, description, "[description is correct]");
            assert.equal(image.tipAmount, '0', "[tip amount is correct]");
            assert.equal(image.author, author, "[author is correct]");
        })

        it("allow user to tip images", async () => {
            // track the author balance before tip
            let oldAuthorBalance;
            let tipAmount = web3.utils.toWei('1', 'Ether')
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = web3.utils.toBN(oldAuthorBalance)
            
            result = await degram.tipImageOwner(imageCount, { from: tipper, value: tipAmount }) 
            // success
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), imageCount.toNumber(), "[id is correct]");
            assert.equal(event.hash, hash, "[hash is correct]");
            assert.equal(event.description, description, "[description is correct]");
            assert.equal(event.tipAmount, tipAmount, "[tip amount is correct]");
            assert.equal(event.author, author, "[author is correct]");

            // check if author balance received the tip
            let newAuthorBalance;
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = web3.utils.toBN(newAuthorBalance)

            let tipImageOwner
            tipImageOwner = tipAmount;
            tipImageOwner = web3.utils.toBN(tipImageOwner)

            const expectedBalance = oldAuthorBalance.add(tipImageOwner)

            assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

            // check the tipImageOwner function
            await degram.tipImageOwner(99, {from: tipper, value: tipAmount}).should.be.rejected;
        })
    }) 
})