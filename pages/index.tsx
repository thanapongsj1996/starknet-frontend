import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { stark } from 'starknet'
import { connect, IStarknetWindowObject } from '@argent/get-starknet'

import styles from '../styles/Home.module.css'

const { compileCalldata } = stark
// const CONTRACT_ADDRESS = '0x00872f12ba1c02fcea6a82765d09df595dec76ba4103f2f40b4fe85e8a1ad909'
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string

type Starknet = IStarknetWindowObject | null

const Home: NextPage = () => {

  const [amount, setAmount] = useState(0)
  const [curBalance, setCurBalance] = useState(0)
  const [starknet, setStarknet] = useState(null as Starknet)

  useEffect(() => {
    if (starknet) {
      starknet?.enable().then(() => getBalance())
    }
  }, [starknet])

  const connectWallet = async () => {
    connect({ modalOptions: { theme: 'dark' } })
      .then(async (res) => {
        setStarknet(res as Starknet)
      })
      .finally(() => console.log('address: ', starknet?.account?.address))
  }

  const getBalance = async () => {
    console.log('address: ', starknet?.account?.address)

    const data = await starknet?.provider.callContract({
      contractAddress: CONTRACT_ADDRESS,
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

  const updateBalance = async (fnName: string) => {
    console.log('address: ', starknet?.account?.address)

    starknet?.account.execute({
      contractAddress: CONTRACT_ADDRESS,
      entrypoint: fnName,
      calldata: [`${amount}`]
    }).then(() => {
      getBalance()
      setAmount(0)
    })
  }

  const getNumber = (num: string) => {
    return parseInt(num, 16)
  }

  const formattedSelectedAccount = (acc: string | undefined) => {
    if (acc && acc != '') return acc.slice(0, 8) + '...' + acc.slice(-6)
    return ''
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>

        <h1 className={styles.title}>
          Demo
        </h1>

        {!starknet &&
          <button className={styles.btn} onClick={() => connectWallet()}>
            Connect Wallet
          </button>
        }

        {starknet && starknet.isConnected &&
          <>
            <p className={styles.address}><strong>Address: </strong>
              {formattedSelectedAccount(starknet?.account?.address)}
            </p>

            {/* <button className={styles.btn} onClick={() => getBalance()}>Get Balance</button> */}

            <h2>Current Balance: {curBalance}</h2>
            <input
              placeholder='amount'
              className={styles.amount__input}
              onChange={e => setAmount(parseInt(e.target.value))}
            />

            <div>
              <button
                className={styles.btn}
                onClick={() => updateBalance('increase_balance')}
              >
                Increase Balance
              </button>

              <button
                className={styles.btn}
                onClick={() => updateBalance('decrease_balance')}
              >
                Decrease Balance
              </button>
            </div>
          </>
        }
      </main>
    </div>
  )
}

export default Home
