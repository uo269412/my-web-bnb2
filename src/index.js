import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import {Contract, ethers} from "ethers";
import { useState, useEffect, useRef } from 'react';
import bankManifest from "./contracts/Bank.json";

function App(){
  const bank = useRef(null);
  const [bnbBalance, setBNBBalance] = useState(0);
  const [bmiwBalance, setBMIWBalance] = useState(0);
  const [tokensBMIWVendidos, setTokensBMIWVendidos] = useState(0);
  
  useEffect( () => {
      initContracts();
  }, [])

  let initContracts = async () => {
      await getBlockchain();
  }

  let getBlockchain = async () => {
      let provider = await detectEthereumProvider();
      if(provider) {
          await provider.request({ method: 'eth_requestAccounts' });
          const networkId = await provider.request({ method: 'net_version' })

          provider = new ethers.providers.Web3Provider(provider);
          const signer = provider.getSigner();

          bank.current = new Contract(
              bankManifest.networks[networkId].address,
              bankManifest.abi,
              signer
          );

      }
      return null;
  }

  let onSubmitDeposit = async (e) => {
    e.preventDefault();

    const BNBamount = parseFloat(e.target.elements[0].value);

    // Wei to BNB se pasa con ethers.utils recibe un String!!!
    const tx = await bank.current.deposit({
        value: ethers.utils.parseEther(String(BNBamount)),
        gasLimit: 6721975,
        gasPrice: 20000000000,
    });

    await tx.wait();
}

let clickWithdraw = async (e) => {
  await await bank.current.withdraw();
}

const updateBalances = async () => {
  if (bank.current) {
    const bnbBalance = (await bank.current.getBNBBalance()).toString();
    const bmiwBalance = (await bank.current.getBMIWBalance()).toString();
    const tokensBMIWVendidos = (await bank.current.tokensBMIWVendidos()).toString();

    setBNBBalance(bnbBalance);
    setBMIWBalance(bmiwBalance);
    setTokensBMIWVendidos(tokensBMIWVendidos);
  }
};

let buyBMIW = async (e) => {
  e.preventDefault();

  const amount = parseInt(e.target.elements[0].value);

  try {
    const tx = await bank.current.buyBMIW(amount, {
      value: ethers.utils.parseEther(String(amount * 0.001)),
      gasLimit: 6721975,
      gasPrice: 20000000000,
    });

    await tx.wait();
  } catch (error) {
    console.error('Error al comprar BMIW:', error);
  }
};

  let onSubmitDepositWithInterest = async (e) => {
    e.preventDefault();

    const BNBamount = parseFloat(e.target.elements[0].value);

    const tx = await bank.current.deposit10Min({
      value: ethers.utils.parseEther(String(BNBamount)),
      gasLimit: 6721975,
      gasPrice: 20000000000,
    });

    await tx.wait();
  };

  let clickWithdrawWithDelay = async () => {
    await bank.current.withdraw10Min();
  };

  return (
    <div>
      <h1>Bank</h1>
      <div>
      <p>------------------------------------------</p>
        <h4>Doble Depósito</h4>
      <form onSubmit={(e) => onSubmitDepositWithInterest(e)}>
        <input type="number" step="0.01" />
        <button type="submit">Deposit double interest</button>
      </form>
      <div>
      <button onClick={() => clickWithdrawWithDelay()}>Withdraw 10 minutes</button>
    </div>
      <p>------------------------------------------</p>
    </div>
      <div>
        <h4>Venta de Tokens BMIW</h4>
      <p>Tokens BMIW Vendidos: {tokensBMIWVendidos} BMIW</p>
      <form onSubmit={(e) => buyBMIW(e)}>
        <input type="number" step="1" />
        <button type="submit">Buy BMIW</button>
      </form>
      <button onClick={updateBalances}>Actualizar Saldos</button>
      <p>------------------------------------------</p>
      </div>
      <div>
      <h4>Previsualizar interés generado y BNB</h4>
        <p>BNB Balance: {bnbBalance} BNB</p>
        <p>BMIW Balance: {bmiwBalance} BMIW</p>
      </div>
      <button onClick={updateBalances}>Actualizar Saldos</button>
      <p>------------------------------------------</p>
      <h4>Banco normal</h4>
      <form onSubmit= { (e) => onSubmitDeposit(e) } >
          <input type="number" step="0.01" />
          <button type="submit">Deposit</button>
      </form>

      <button onClick= { () => clickWithdraw() } > Withdraw </button>
  </div>

  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
