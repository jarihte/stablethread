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
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'POST'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

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
      socket.on('alert', (data) => {
        socket.broadcast.emit('alert', data);
      });
      socket.on('transfer', (data) => {
        socket.broadcast.emit('transfer', data);
      });
      socket.on('join', (room) => {
        socket.join(room);
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
