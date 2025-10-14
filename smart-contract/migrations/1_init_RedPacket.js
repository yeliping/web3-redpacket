const RedPacket = artifacts.require('RedPacket')

module.exports = async function (deployer) {
  // 红包个数 = 10，是否平均 = false（即随机红包）
  const count = 10
  const isEqual = false

  // 发放 0.01 ETH 的红包
  const amountInEther = '0.01'

  await deployer.deploy(RedPacket, count, isEqual, {
    value: web3.utils.toWei(amountInEther, 'ether'),
  })
}
