import React from 'react'
import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import add_like from './assets/add_like.png';
import del_like from './assets/del_like.png';
import like from './assets/like.png';

import './App.css';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {Program, Provider, web3} from '@project-serum/anchor';
import kp from './keypair.json';

const {SystemProgram, Keypair} = web3;

// Get keypair from kepair.json
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}



// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

const TEST_GIFS = [
	'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
	'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
	'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
	'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp'
]  

  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  const onInputChange = (event) => {
      const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, window.solana, opts.preflightCommitment);

    return provider;

  }

  const getGifList = async() => {
    try {
      console.log('1')
      const provider = getProvider();
      console.log('2')
      const program = new Program(idl, programID, provider);
      console.log('3')
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account);

      console.log("Gif List", account.gifList)



      setGifList(account.gifList);


    } catch(error) {
      console.log("Error in getGitList",error)
      setGifList(null)
    }

  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      console.log('Got provideer');
      const program = new Program(idl, programID, provider);

      console.log('ping');
      await program.rpc.startStuffOff(
        {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId
          },
          signers: [baseAccount]
        }
      )

      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())

      await getGifList();

    }
    catch (error)
    {
      console.log('Error creating BaseAccount account:', error)
    }
  }

  

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    setInputValue('');
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  const voteGif = async (gifLink) => {

    console.log(gifLink)

    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      const action = "like";
  
      await program.rpc.updateItem(gifLink, action, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });

      console.log("GIF successfully updated to program", gifLink)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }

  };

  const unVoteGif = async (gifLink) => {

    console.log(gifLink)

    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      const action = "dislike";
  
      await program.rpc.updateItem(gifLink, action, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });

      console.log("GIF successfully updated to program", gifLink)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }

  };


  /*
   * Let's define this method so our code doesn't break.
   * We will write the logic for this next!
   */
  const connectWallet = async () => {
  const { solana } = window;

  if (solana) {
    const response = await solana.connect();
    console.log('Connected with Public Key:', response.publicKey.toString());
    setWalletAddress(response.publicKey.toString());
  }

  };  

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
      
    </button>
  );

  const renderConnectedContainer = () => {
    if (gifList === null)
    {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account

          </button>
        </div>

      )

    }
    else
    {
      return (
        <div className="connected-container">
          <form  onSubmit={(event) => {
                event.preventDefault();
                sendGif();
                  }}
          >
            <input  type="text"  placeholder="Enter gif link!"  value={inputValue}  onChange={onInputChange}/>

            <button type="submit" className="cta-button submit-gif-button">Submit</button>
          </form> 

          
          <div className="gif-grid">
             {gifList.map((item,index) => (
                  <div className="gif-item" key={index}  > 
                        
                        <div> <img src={item.gifLink} /></div>
                        <div className="gif-vote"> 
                          <div><img src={add_like} onClick={()=> voteGif(item.gifLink)}></img></div>
                          <div className="img-like-counter no-cursor">{item.votes}</div>
                          <div><img src={del_like} onClick={()=> unVoteGif(item.gifLink)}></img></div>

                        </div>

                        
                        
                  </div>
                  ))} 
          </div>
        </div>
      )
    }
  
  };

    /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');

        /*
         * The solana object gives us a function that will allow us to connect
         * directly with the user's wallet!
         */
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          'Connected with Public Key:',
          response.publicKey.toString()
        );

          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());        

        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);

    //setGifList(TEST_GIFS);
 }, []);

useEffect(() => {
  if (walletAddress) {
    console.log('Fetching GIF list...');

    getGifList();
    
    // Call Solana program here.

    // Set state
    //setGifList(TEST_GIFS);
  }
}, [walletAddress]); 

  return (
    <div className="App">
      <div className="container">
        <div className="header-container...">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}     
          {walletAddress && renderConnectedContainer()}      
           


        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
