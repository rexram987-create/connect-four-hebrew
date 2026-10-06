import {chooseMove} from './ai.js';
self.onmessage = ({data}) => {
  const {requestId,board,player,difficulty}=data;
  self.postMessage({requestId,column:chooseMove(board,player,difficulty)});
};
