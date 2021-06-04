import React, {Component, useState, useEffect } from 'react';

class GetNFTMeta extends Component {
    constructor(props) {
        super(props);

        this.state = {
            address: this.props.drizzleState.accounts[0],
            tokenId: null,
            ipfsHash: null,
            txHash: null,
            imageHash: null,
            age: null,
            description: '',
            imageHash: null,
            position: '',
            title: null
        };

        this.handleSearch = this.handleSearch.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.tokenId = React.createRef();
        //this.handleHashChange = this.handleHashChange.bind(this);
    }

    handleChange = async e => {
        const tokenId = e.target.value;

        
        this.setState( { tokenId });
        console.log( this.state.tokenId )
    }

    prepareHash = async (tokenId, user, contract) => {
        const txHash = contract.methods["tokenURI"].cacheCall(tokenId, {
            from: user
        });

        return txHash;
    }

    handleSearch = async event => {
        event.preventDefault();

        const {drizzle, drizzleState} = this.props;
        const contract = drizzle.contracts.NFTmint;
        const user = drizzleState.accounts[0];
        const tokenId =  this.tokenId.current.value;
        const { NFTmint } = drizzleState.contracts;

        const txHash = await this.prepareHash(tokenId, user, contract);

        this.setState( { txHash });
        console.log(txHash)
        const ipfsHash = await NFTmint.tokenURI[txHash];
        if( ipfsHash && ipfsHash.value){
            this.setState( { ipfsHash: ipfsHash.value });
            fetch('https://ipfs.io/ipfs/' + ipfsHash.value)
            .then(response => response.json())
            .then( (data) => {
                this.setState( data )
            })
        }

    }

    printResult = () => {
        if( ! this.state.ipfsHash || ! this.state.title) return null;

        const { drizzleState } = this.props;
        const { NFTmint } = drizzleState.contracts;
        return(
            <ul className="itemContainer">
            <li><h3>Name: {this.state.title}</h3></li>
            <li>BSC Tx: {this.state.txHash}</li>
            <li>IPFS Hash:  <a href={'https://ipfs.io/ipfs/' + this.state.ipfsHash } target="_blank">{this.state.ipfsHash}</a></li>
            <li>Description: {this.state.description}</li>
            <li>Position: {this.state.position}</li>
            <li>Age: {this.state.age}</li>
            <li>Image Hash: 
                <div>
                    <a href={'https://ipfs.io/ipfs/' + this.state.imageHash } target="_blank">{this.state.imageHash}</a>
                </div> 
                <img className="nft-image" src={this.state.imageHash ? 'https://ipfs.io/ipfs/' + this.state.imageHash : ''} ></img></li>
        </ul>
        )
            
    }



    render () {
    
        //return <div>Current Token: { this.state.tokenId } MetaValue: { metaValue && metaValue.value }</div>
        return (
            <div className="column">
                <h2>Search Opera by tokenId</h2>
                <form onSubmit={this.handleSearch} className="searchMeta">
                    <label>
                        Search by Token ID:
                        <input type="text" name="tokenId" ref={this.tokenId} />
                    </label>
                    <input type="submit" className="submitButton" value="Search NFT Meta" />
                </form>
                { this.printResult() }
            </div>
        )
    }



}

export default GetNFTMeta;