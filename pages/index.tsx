import { useState } from 'react'
import type { NextPage } from 'next'
import { stark } from 'starknet'
import { connect, IStarknetWindowObject } from '@argent/get-starknet'

import styles from '../styles/Home.module.css'

const { compileCalldata } = stark
const userBalanceContractAddr = '0x062df77e8b24159df7a92981caf07c0c83c3574a1a329204884081dbdacd54da'

const Home: NextPage = () => {

  const [starknet, setStarknet] = useState(null as IStarknetWindowObject | null)
  const [amount, setAmount] = useState(0)
  const [curBalance, setCurBalance] = useState(0)

  const connectWallet = async () => {
    connect()
      .then((res) => setStarknet(res as IStarknetWindowObject))
      .finally(() => console.log('address: ', starknet?.account?.address))
  }

  const getBalance = async () => {
    console.log('address: ', starknet?.account?.address)

    if (!starknet || !starknet.account || !starknet.account.address) connectWallet()

    const data = await starknet?.provider.callContract({
      contractAddress: userBalanceContractAddr,
      entrypoint: 'get_balance',
      calldata: compileCalldata({
        user: starknet?.selectedAddress as string
      })
    })

    if (data && data.result[0]) {
      const balance = getNumber(data.result[0])
      console.log('balance : ', balance)
      setCurBalance(balance)
    }
  }

  const getOne = async () => {
    console.log('address: ', starknet?.account?.address)

    if (!starknet || !starknet.account || !starknet.account.address) connectWallet()

    const data = await starknet?.provider.callContract({
      contractAddress: userBalanceContractAddr,
      entrypoint: 'get_one',
      calldata: ['100'],
    })

    if (data && data.result[0]) {
      console.log(getNumber(data.result[0]))
    }
  }

  const updateBalance = async (fnName: string) => {
    console.log('address: ', starknet?.account?.address)

    if (!starknet || !starknet.account || !starknet.account.address) connectWallet()

    starknet?.account.execute({
      contractAddress: userBalanceContractAddr,
      entrypoint: fnName,
      calldata: compileCalldata({
        amount: `${amount}`
      })
    })
  }

  const getNumber = (num: string) => {
    return parseInt(num, 16)
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Wallet
        </h1>
        {!starknet && <button onClick={connectWallet}>login</button>}
        {starknet &&
          <>
            <button onClick={getBalance}>Get Balance</button>
            <span>Current Balance: {curBalance}</span>

            <input onChange={e => setAmount(parseInt(e.target.value))} />
            <div>
              <button onClick={() => updateBalance('increase_balance')}>
                Increase balance
              </button>
              <button onClick={() => updateBalance('decrease_balance')}>
                Decrease balance
              </button>
            </div>
          </>
        }

      </main>
    </div>
  )
}

export default Home
