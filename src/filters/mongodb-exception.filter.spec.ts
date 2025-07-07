import { MongodbExceptionFilter } from './mongodb-exception.filter';

describe('MongodbExceptionFilter', () => {
  it('should be defined', () => {
    expect(new MongodbExceptionFilter()).toBeDefined();
  });
});
