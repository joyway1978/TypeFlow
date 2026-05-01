export interface Sentence {
  id: number;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const sentences: Sentence[] = [
  { id: 1, text: 'I like to read books in the morning.', difficulty: 'easy' },
  { id: 2, text: 'She enjoys cooking dinner for her family.', difficulty: 'easy' },
  { id: 3, text: 'The coffee is too hot to drink.', difficulty: 'easy' },
  { id: 4, text: 'We went to the park after school.', difficulty: 'easy' },
  { id: 5, text: 'He plays the guitar very well.', difficulty: 'easy' },
  { id: 6, text: 'It is raining outside right now.', difficulty: 'easy' },
  { id: 7, text: 'My cat loves to sleep all day.', difficulty: 'easy' },
  { id: 8, text: 'She went to the store to buy some bread and milk.', difficulty: 'medium' },
  { id: 9, text: 'The weather today is sunny and warm with a light breeze.', difficulty: 'medium' },
  { id: 10, text: 'I have been learning English for about two years now.', difficulty: 'medium' },
  { id: 11, text: 'We should take a walk before the sun goes down.', difficulty: 'medium' },
  { id: 12, text: 'He fixed the computer after reading the instructions carefully.', difficulty: 'medium' },
  { id: 13, text: 'My favorite hobby is taking photos of old buildings.', difficulty: 'medium' },
  { id: 14, text: 'Could you tell me how to get to the train station?', difficulty: 'medium' },
  { id: 15, text: 'They are planning a trip to Japan for next summer.', difficulty: 'medium' },
  { id: 16, text: 'He has been working on this project for three months without a single day off.', difficulty: 'hard' },
  { id: 17, text: 'The restaurant we visited last night served the most delicious pasta I have ever tasted.', difficulty: 'hard' },
  { id: 18, text: 'Although the exam was quite challenging, she managed to finish all the questions on time.', difficulty: 'hard' },
  { id: 19, text: 'Technology has fundamentally changed the way people communicate and share information.', difficulty: 'hard' },
  { id: 20, text: 'If you practice speaking English every day, you will gradually become more confident and fluent.', difficulty: 'hard' },
];
