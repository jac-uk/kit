import { shallowMount } from '@vue/test-utils';
import TextField from '@/components/Form/TextField';

describe('components/Form/TextField', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(TextField);
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  describe('TextField props', () => {

    describe('label', () => {
      it('sets the label', () => {
        wrapper.setProps({ label: 'My Form Label' });
        expect(wrapper.find('label').text()).toBe('My Form Label');
      });
    });

    describe('hint', () => {
      it('shows hint element if hint is true', () => {
        wrapper.setProps({ hint: 'my_hint' });
        expect(wrapper.find('.govuk-hint').exists()).toBe(true);
      });

      it('sets hint element content', () => {
        wrapper.setProps({ hint: 'Hint for the label!' });
         expect(wrapper.find('.govuk-hint').text()).toBe('Hint for the label!');
      });

      it('does not show hint if hint is not passed', () => {
        expect(wrapper.find('.govuk-hint').exists()).toBe(false);
      });
    });

    describe('id', () => {
      it('sets label for attribute', () => {
        wrapper.setProps({ id: 'my_unique_key' });
        expect(wrapper.find('label').attributes().for).toBe('my_unique_key');
      });

      it('sets id for input', () => {
        wrapper.setProps({ id: 'my_unique_key' });
        expect(wrapper.find('input').attributes().id).toBe('my_unique_key');
      });
    });
  });

  describe('`v-model` interface', () => {
    describe('when text changes', () => {
      it('it emits an input event with the new value', () => {
        wrapper.setData({ text: 'new-value' })
        expect(wrapper.emitted().input).toEqual([['new-value']]);
      });
    });

    describe('when value prop changes', () => {
      it('updates the text computed property', () => {
        wrapper.setProps({ value: 'my_value' });
        expect(wrapper.vm.text).toEqual('my_value')
      });
    });
  });

    // describe('klass', () => {
    //   it('sets the class attribute', () => {
    //     wrapper.setProps({ klass: 'my_styling' });
    //     expect(wrapper.find('input').attributes().class).toContain('my_styling');
    //   });
    // });

});
