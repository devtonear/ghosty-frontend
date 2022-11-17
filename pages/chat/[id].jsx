import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'

import ChatInfo from '../../components/Chat/ChatInfo'
import LeftSide from '../../components/ChatRoom/LeftSide'
import MiddleSide from '../../components/ChatRoom/MiddleSide'
import { API_URL } from '../../constants/apiUrl'
import near from '../../lib/near'

const Chat = ({ initEmoji, userProfile, currentUser }) => {
	const [toggleUserInfo, setToggleUserInfo] = useState(true)
	const [activeUsers, setActiveUsers] = useState()
	const socket = io('http://localhost:8000')
	const router = useRouter()

	useEffect(() => {
		if (near?.currentUser?.accountId !== undefined) {
			if (near?.currentUser?.accountId !== router.query.id) {
				router.push('/')
			}
		}
	}, [near?.currentUser?.accountId])

	useEffect(() => {
		socket.emit('addUser', currentUser, userProfile)

		socket.on('getUser', (users) => {
			setActiveUsers(users)
		})
	}, [])

	return (
		<div className="grid grid-cols-5 h-[100vh]">
			<LeftSide
				userProfile={userProfile}
				currentUser={currentUser}
				activeUsers={activeUsers}
				className="relative border-r-[1px]"
			/>
			<MiddleSide
				socket={socket}
				currentUser={currentUser}
				activeUsers={activeUsers}
				className="relative col-span-3 border-r-[1px]"
				initEmoji={initEmoji}
				isToggleAddressInfo={(e) => setToggleUserInfo(e)}
			/>
			{toggleUserInfo && <ChatInfo activeUsers={activeUsers} />}
		</div>
	)
}

export default Chat

export async function getServerSideProps({ params }) {
	const res = await axios.get(`${API_URL}/api/profile`, {
		params: {
			accountId: params.id,
		},
	})

	const userProfile = (await res.data.data) || null
	const currentUser = params.id

	return {
		props: {
			userProfile: userProfile,
			currentUser: currentUser,
			// error handling on emoji height
			initEmoji: true,
		},
	}
}