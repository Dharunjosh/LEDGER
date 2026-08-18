import Todo from '../models/Todo.js';
import buildItemRoutes from './itemRoutesFactory.js';

export default buildItemRoutes(Todo, 'todo');
