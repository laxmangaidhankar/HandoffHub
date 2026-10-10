import { Link } from 'react-router-dom';
import { RoomLayout } from '../components/createRoom/CreateRoomLayout';
import { CreateRoomForm } from '../components/createRoom/CreateRoomForm';

const CreateRoom = () => {
  return (
    <RoomLayout>
      <div className="w-full">
        <CreateRoomForm />

        <div className="mt-4 text-center">
          <span className="text-gray-500">
            Already have a room?
          </span>{' '}
          <Link
            to="/join"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Join a room
          </Link>
        </div>
      </div>
    </RoomLayout>
  );
};

export default CreateRoom;