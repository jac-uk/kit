<template>
  <div
    ref="autocompleteContainer"
    class="govuk-form-group"
    :class="{'govuk-form-group--error': hasError}"
  >
    <h1 class="govuk-label-wrapper">
      <label
        class="govuk-label govuk-label--l"
        :for="id"
      >
        {{ label }}
      </label>
    </h1>
    <span
      v-if="hint"
      class="govuk-hint"
    >
      {{ hint }}
    </span>
    <FormFieldError
      :id="id"
      :error-message="errorMessage"
    />
    <div class="autocomplete-container">
      <input
        :id="id"
        ref="autocompleteRef"
        v-model="searchTerm"
        class="govuk-input"
        :class="{'govuk-input--error': hasError}"
        :required="required"
        aria-autocomplete="list"
        aria-controls="autocomplete-list"
        autocomplete="off"
        @input="filterResults"
        @focus="onFocus"
        @keydown.esc="onEsc"
        @keydown.down="onArrowDown"
        @keydown.up="onArrowUp"
        @keydown.enter.prevent="onEnter"
        @blur="onBlur"
      >
      <ul
        v-if="filteredResults.length && listVisible"
        id="autocomplete-list"
        class="govuk-list govuk-list--unstyled autocomplete-list"
      >
        <li
          v-for="(result, index) in filteredResults"
          :key="result.id"
          :class="{'govuk-list__item--highlighted': highlightedIndex === index}"
          @mousedown="onSelect(result)"
          @mouseover="highlightedIndex = index"
        >
          <span>
            {{ formatResult(result) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import FormField from './FormField.vue';
import FormFieldError from './FormFieldError.vue';

export default {
  components: {
    FormFieldError,
  },
  extends: FormField,
  props: {
    modelValue: {
      default: '',
      type: [Object, String, Number, Boolean],
    },
    data: {
      type: Array,
      default: () => [],
    },
    searchFields: {
      type: Array,
      default: () => [],
    },
    id: {
      type: String,
      required: true,
    },
    showFullListOnFocus: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      searchTerm: this.modelValue,
      filteredResults: [],
      highlightedIndex: -1,
      listVisible: false,
    };
  },
  computed: {
    hasError() {
      return !!this.errorMessage;
    },
  },

  watch: {
    modelValue(newValue) {
      this.searchTerm = newValue;
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    filterResults() {
      if (!this.searchTerm && this.showFullListOnFocus) {
        this.filteredResults = this.data.slice(0, 50);
        this.listVisible = true;
        return;
      }

      if (!this.searchTerm) {
        this.listVisible = false;
        return;
      }

      const searchTerm = this.searchTerm.toLowerCase();
      this.filteredResults = this.data.filter(item => {
        return this.searchFields.some(field =>
          item[field] && item[field].toLowerCase().includes(searchTerm)
        );
      }).slice(0, 50);
      this.listVisible = true;
    },
    onFocus() {
      if (!this.searchTerm && this.showFullListOnFocus) {
        this.filterResults();
      } else if (this.searchTerm && !this.listVisible) {
        this.filterResults();
      }
    },
    onArrowDown() {
      if (this.highlightedIndex < this.filteredResults.length - 1) {
        this.highlightedIndex += 1;
      }
    },
    onArrowUp() {
      if (this.highlightedIndex > 0) {
        this.highlightedIndex -= 1;
      }
    },
    onEsc() {
      this.listVisible = false;
      this.highlightedIndex = -1;
      this.$refs.autocompleteRef.blur();
    },
    onEnter() {
      if (this.highlightedIndex >= 0 && this.filteredResults[this.highlightedIndex]) {
        this.onSelect(this.filteredResults[this.highlightedIndex]);
      }
    },
    onSelect(result) {
      const selectedValue = result[this.searchFields[0]];
      this.searchTerm = selectedValue;
      this.$emit('update:modelValue', selectedValue);
      this.highlightedIndex = -1;
      this.listVisible = false;
    },
    onBlur() {
      this.listVisible = false;
    },
    handleClickOutside(event) {
      const autocompleteContainer = this.$refs.autocompleteContainer;
      if (autocompleteContainer && !autocompleteContainer.contains(event.target)) {
        this.listVisible = false;
      }
    },
    formatResult(result) {
      return this.searchFields.map((field, index) => {
        return result[field] + (index < this.searchFields.length - 1 ? ', ' : '');
      }).join('');
    },
  },
};
</script>

<style scoped>
.autocomplete-container {
  position: relative;
}

.autocomplete-list {
  position: absolute;
  width: 100%;
  border: 1px solid #b3b3b3;
  border-top: none;
  background: #fff;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  padding: 0;
  margin: 0;
  list-style-type: none;
}

.govuk-list__item {
  padding: 8px;
  cursor: pointer;
}

.govuk-list__item--highlighted {
  background-color: #b3d4fc;
}

.govuk-input--error {
  border-color: #d4351c;
  box-shadow: 0 0 0 2px rgba(211, 53, 28, 0.2);
}
</style>
