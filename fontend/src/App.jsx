import { useEffect, useMemo, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
} from 'wagmi'
import { formatEther, parseAbiItem } from 'viem'
import abi from './abi.json'

// 合约地址（Sepolia）
const CONTRACT_ADDRESS = '0xC1eE62365fdA52e3fbCc0CC01Bd5365865DaA40d'

export default function App() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()

  const [grabbedAmount, setGrabbedAmount] = useState(null)
  const [statusMsg, setStatusMsg] = useState('进行中')
  const [errorMsg, setErrorMsg] = useState('')

  // Reads
  const { data: totalAmount, refetch: refetchTotal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'totalAmount',
    watch: true,
  })
  const { data: count, refetch: refetchCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'count',
    watch: true,
  })
  const { data: grabbedFlag, refetch: refetchGrabbed } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'isGrabbed',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
    watch: true,
  })

  const { writeContractAsync } = useWriteContract()

  const totalEth = useMemo(
    () => (totalAmount ? formatEther(totalAmount) : '0'),
    [totalAmount],
  )

  // Progress text
  const leftCount = useMemo(() => (count ? Number(count) : 0), [count])

  // Parse logs helper (event is optional in user's contract)
  const grabbedEventSig = useMemo(
    () =>
      parseAbiItem('event Grabbed(address indexed account, uint256 amount)'),
    [],
  )

  const handleGrab = async () => {
    setErrorMsg('')
    try {
      // read total before for fallback
      const before = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'totalAmount',
      })

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'grabRedPacket',
      })

      setStatusMsg('交易进行中...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      // Try decode event (if contract emits Grabbed)
      let amountFromEvent = null
      try {
        for (const log of receipt.logs) {
          try {
            const parsed = publicClient.decodeEventLog({
              abi,
              data: log.data,
              topics: log.topics,
            })
            if (
              parsed?.eventName === 'Grabbed' &&
              parsed.args?.account?.toLowerCase() === address?.toLowerCase()
            ) {
              amountFromEvent = parsed.args.amount
              break
            }
          } catch {}
        }
      } catch {}

      let pretty = null
      if (amountFromEvent) {
        pretty = formatEther(amountFromEvent)
      } else {
        // fallback: total before - total after
        const after = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: 'totalAmount',
        })
        const diff = BigInt(before) - BigInt(after)
        pretty = formatEther(diff)
      }

      setGrabbedAmount(pretty)
      setStatusMsg('领取成功')
      await Promise.all([refetchTotal(), refetchCount(), refetchGrabbed()])
    } catch (e) {
      console.error(e)
      setErrorMsg(e?.shortMessage || e?.message || '交易失败')
      setStatusMsg('进行中')
    }
  }

  function getRandomColor() {
    if (count && totalAmount) {
      // console.log(count, totalAmount)

      return Math.max(0, 100 - (Number(count) / Number(count) + 1) * 100)
    } else {
      return 10
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center p-6'>
      <header className='w-full flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-extrabold text-pink-600 flex items-center gap-2'>
          {/* <span className='text-3xl'>🎁</span> 链上红包 */}
        </h1>
        <div className='flex items-center gap-3'>
          <span className='text-sm text-gray-500 hidden md:inline'>
            Sepolia
          </span>
          <ConnectButton />
        </div>
      </header>

      <main className='w-full max-w-3xl'>
        <section className='bg-white rounded-2xl shadow-lg p-8 text-center'>
          {grabbedFlag && Number(grabbedFlag) === 1 ? (
            <div className='space-y-3'>
              <div className='text-green-600 font-semibold'>
                ✅ 已领取红包！
              </div>
              {grabbedAmount ? (
                <div className='text-red-500 text-3xl font-bold'>
                  {grabbedAmount} ETH
                </div>
              ) : (
                <div className='text-gray-400 text-lg'>
                  已领取，刷新后可见金额
                </div>
              )}
              <p className='text-gray-500'>恭喜你获得了这个金额！</p>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='text-3xl font-bold text-pink-600'>
                点此领取红包
              </div>
              <button
                disabled={!isConnected || leftCount === 0}
                onClick={handleGrab}
                className='bg-pink-500 disabled:bg-pink-200 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full text-lg hover:bg-pink-600 transition-all'
              >
                抢红包
              </button>
              {!isConnected && (
                <p className='text-sm text-gray-500'>请先连接钱包</p>
              )}
            </div>
          )}
          {errorMsg && <p className='text-red-500 mt-4'>{errorMsg}</p>}
          <p className='text-gray-400 text-sm mt-2'>{statusMsg}</p>
        </section>

        <section className='bg-white rounded-xl shadow-md p-6 mt-8'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>红包统计</h2>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='flex flex-col'>
              <span className='text-gray-500'>总金额</span>
              <span className='font-mono'>{totalEth} ETH</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-gray-500'>剩余数量</span>
              <span className='font-mono'>{leftCount}</span>
            </div>
          </div>
          <div className='mt-4'>
            <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-pink-500'
                style={{
                  width: `${getRandomColor()}%`,
                }}
              />
            </div>
          </div>
          <div className='mt-2 text-green-600 text-sm'>
            状态：{leftCount > 0 ? '进行中' : '已结束'}
          </div>
        </section>

        <section className='bg-white rounded-xl shadow p-6 mt-8 text-gray-600 text-sm leading-relaxed'>
          <h2 className='font-semibold mb-2'>使用说明</h2>
          <ol className='list-decimal pl-5 space-y-1'>
            <li>每个地址只能抢一次红包</li>
            <li>随机/平均分配由合约决定，公开透明</li>
            <li>抢到即到账，等待区块确认即可</li>
          </ol>
        </section>
      </main>
    </div>
  )
}
