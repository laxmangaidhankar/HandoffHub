import {RoomLayout} from '../components/createRoom/CreateRoomLayout';
import {JoinRoomForm} from '../components/createRoom/JoinRoomForm';
import { Link } from 'react-router-dom';

const joinRoom =() => {
  return (
    <RoomLayout>
          <div className="w-full">
            <JoinRoomForm />
    
            <div className="mt-4 text-center">
              <span className="text-gray-500">
                Wanted to start you're own room?
              </span>{' '}
              <Link
                to="/create"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create a room
              </Link>
            </div>
          </div>
        </RoomLayout>
  )
}

export default joinRoom;