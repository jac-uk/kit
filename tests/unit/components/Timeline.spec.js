import { createTestSubject } from '../helpers';
import Timeline from '@/draftComponents/Timeline';

const testTimelineData = [
  { entry: 'Test1', date: 'Test2' },
  { entry: 'Test3', date: 'Test4' },
];

xdescribe('components/Timeline', () => {
  it('renders the component', () => {
    const wrapper = createTestSubject(Timeline, { data: testTimelineData });
    expect(wrapper.exists()).toBe(true);
  });

  describe('properties', () => {
    let prop;

    describe('data', () => {
      beforeEach(() => {
        prop = Timeline.props.data;
      });

      it('is required', () => {
        expect(prop.required).toBe(true);
      });

      it('should be array', () => {
        expect(prop.type).toBe(Array);
      });
    });
  });

  describe('markup', () => {
    let wrapper;

    beforeEach(() => {
      const testData = [
        { entry: 'a', date: '11 Oct' },
        { entry: 'b', date: '12 Oct' },
        { entry: 'c', date: '13 Oct' },
      ];

      wrapper = createTestSubject({ data: testData });
    });

    it('renders data that is passed as prop', () => {
      expect(wrapper.findAll('li').length).toBe(3);
    });
  });
});
