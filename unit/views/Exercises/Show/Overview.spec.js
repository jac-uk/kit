import Overview from '@/views/Exercises/Show/Overview';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Timeline from '@/components/Page/Timeline';
import exerciseTimeline from '@/helpers/Timeline/exerciseTimeline';
import createTimeline from '@/helpers/Timeline/createTimeline';

jest.mock('@/helpers/Timeline/exerciseTimeline', () => {
  return jest.fn().mockImplementation(() => {
    return [];
  });
});

jest.mock('@/helpers/Timeline/createTimeline', () => {
  return jest.fn().mockImplementation(() => {
    return [];
  });
});

const localVue = createLocalVue();
localVue.use(Vuex);

const exercise = {
  immediateStart: '56',
  applicationOpenDate: 'TestOpen',
  applicationCloseDate: 'TestClose',
};

const store = new Vuex.Store({
  modules: {
    exerciseDocument: {
      namespaced: true,
      state: {
        record: exercise,
      },
      getters: {
        data: () => () => exercise,
      },
    },
  },
});

const createTestSubject = () => {
  return shallowMount(Overview, {
    store,
    localVue,
  });
};

describe('@/views/Exercises/Show', () => {
  describe('template', () => {
    it('renders Timeline component', () => {
      let wrapper = createTestSubject();
      expect(wrapper.find(Timeline).exists()).toBe(true);
    });
  });

  describe('computed properties', () => {
    describe('exercise', () => {
      it('returns record object from state', () => {
        let wrapper = createTestSubject();
        expect(wrapper.vm.exercise).toEqual(exercise);
      });
    });

    describe('timeline', () => {
      beforeEach(() => {
        createTestSubject();
      });
      it('calls exerciseTimeline helper', () => {
        expect(exerciseTimeline).toHaveBeenCalled();
      });

      it('calls createTimeline helper', () => {
        expect(createTimeline).toHaveBeenCalled();
      });

      it('calls createTimeline helper with array and passes 2 as length', () => {
        expect(createTimeline).toHaveBeenCalledWith([], 2);
      });
    });
  });
});
