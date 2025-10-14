// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RedPacket {
    address payable public yideng;
    uint256 public totalAmount;
    uint256 public count;
    bool public isEqual;
    mapping(address => uint256) public isGrabbed;

    // 定义事件（用于前端监听）
    event Grabbed(address indexed account, uint256 amount);

    constructor(uint256 _count, bool _isEqual) payable {
        require(_count > 0, "Count must be > 0");
        yideng = payable(msg.sender);
        count = _count;
        isEqual = _isEqual;
        totalAmount = msg.value;
    }

    function grabRedPacket() public {
        require(count > 0, "All red packets grabbed");
        require(totalAmount > 0, "No money left");
        require(isGrabbed[msg.sender] == 0, "Already grabbed");

        isGrabbed[msg.sender] = 1;
        uint256 amount;

        if (count == 1) {
            amount = totalAmount;
        } else if (isEqual) {
            amount = totalAmount / count;
        } else {
            uint256 avg = totalAmount / count;
            uint256 max = avg * 2;
            uint256 min = avg / 100; // 1%
            uint256 range = max - min;

            uint256 rand = uint256(
                keccak256(
                    abi.encode(
                        block.timestamp,
                        block.prevrandao,
                        msg.sender,
                        totalAmount,
                        count
                    )
                )
            );
            amount = (rand % range) + min;
            amount = amount > totalAmount ? totalAmount : amount;
        }

        payable(msg.sender).transfer(amount);
        totalAmount -= amount;
        count--;

        // ✅ 新增：在转账后触发事件
        emit Grabbed(msg.sender, amount);
    }
}

// contract RedPacket {
//     address payable public yideng;
//     uint256 public totalAmount;
//     uint256 public count;
//     bool public isEqual;
//     mapping(address => uint256) public isGrabbed;

//     constructor(uint256 _count, bool _isEqual) payable {
//         require(_count > 0, "Count must be > 0");
//         yideng = payable(msg.sender);
//         count = _count;
//         isEqual = _isEqual;
//         totalAmount = msg.value;
//     }

//     function grabRedPacket() public {
//         require(count > 0, "All red packets grabbed");
//         require(totalAmount > 0, "No money left");
//         require(isGrabbed[msg.sender] == 0, "Already grabbed");

//         isGrabbed[msg.sender] = 1;
//         uint256 amount;

//         if (count == 1) {
//             amount = totalAmount;
//         } else if (isEqual) {
//             amount = totalAmount / count;
//         } else {
//             uint256 avg = totalAmount / count;
//             uint256 max = avg * 2;
//             uint256 min = avg / 100; // 1%
//             uint256 range = max - min;

//             // 随机红包
//             uint256 rand = uint256(
//                 keccak256(
//                     abi.encode(
//                         block.timestamp,
//                         block.prevrandao,
//                         msg.sender,
//                         totalAmount,
//                         count
//                     )
//                 )
//             );
//             amount = (rand % range) + min;
//             amount = amount > totalAmount ? totalAmount : amount;
//         }

//         // 转账
//         payable(msg.sender).transfer(amount);

//         // 更新状态
//         totalAmount -= amount;
//         count--;
//     }
// }
