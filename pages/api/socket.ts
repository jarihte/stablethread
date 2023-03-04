import type { Server as HTTPServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';
import type { Server as IOServer } from 'socket.io';
import { Server as ServerIO } from 'socket.io';
import NextCors from 'nextjs-cors';

interface SocketServer extends HTTPServer {
  io: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

// eslint-disable-next-line max-len
const ioHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // Enable CORS
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'POST'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  // If socket.io is not initialized, initialize it
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'HEAD', 'POST'],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      },
    });

    io.on('connection', (socket) => {
      socket.on('transfer', (data) => {
        socket.broadcast.emit('transfer', data);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
