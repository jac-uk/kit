<template>
  <div class="editable-field">
    <div
      v-if="!editField"
      class="non-editable"
    >
      <span v-if="isEmail">
        <a
          :href="`mailto:${value}`"
          class="govuk-link govuk-link--no-visited-state wrap"
          target="_blank"
        >
          {{ value }}
        </a>
      </span>
      <span v-if="isRoute">
        <RouterLink
          :to="{ ...routeTo }"
        >
          {{ value }}
        </RouterLink>
      </span>
      <span
        v-if="isText"
        class="wrap"
      >
        {{ value }}
      </span>
      <p
        v-if="isTextarea"
        class="wrap"
      >
        {{ value }}
      </p>
      <span
        v-if="isDate"
        class="wrap"
      >
        {{ value | formatDate }}
      </span>
      <span
        v-if="isSelection"
        class="wrap"
      >
        {{ value | lookup | toYesNo }}
      </span>
      <a
        href="#"
        class="govuk-link change-link print-none"
        @click.prevent="btnClickEdit()"
      >
        {{ link }}
      </a>
    </div>
    <div
      v-if="editField"
      class="edit-field"
    >
      <TextField
        v-if="isText || isEmail || isRoute"
        :id="`editable-field-${id}`"
        v-model="localField"
      />
      <TextareaInput
        v-if="isTextarea"
        :id="`editable-field-${id}`"
        v-model="localField"
      />
      <DateInput
        v-if="isDate"
        :id="`data-of-birth-${id}`"
        v-model="localField"
        :value="localField"
      />

      <Select
        v-if="isSelection"
        :id="`selection-input-${id}`"
        v-model="localField"
      >
        <option
          v-for="option in options"
          :key="option"
          :value="option"
        >
          {{ option | lookup | toYesNo }}
        </option>
      </Select>

      <button
        class="govuk-button govuk-button--warning govuk-!-margin-right-3"
        @click="cancelEdit()"
      >
        Cancel
      </button>
      <button
        class="govuk-button"
        @click="btnClickSubmit()"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script>
import TextField from './Form/TextField';
import TextareaInput from './Form/TextareaInput';
import DateInput from './Form/DateInput';
import formatEmail from '../helpers/Form/formatEmail';
import Select from './Form/Select.vue';

export default {
  components: {
    TextField,
    TextareaInput,
    DateInput,
    Select,
  },
  props: {
    field: {
      type: String,
      default: 'value',
    },
    value: {
      type: [String, Date, Number, Object, Boolean],
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    link: {
      type: String,
      default: 'Change',
    },
    options: {
      type: Array,
      default: null,
    },
    routeTo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      localField: '',
      editField: false,
      id: null,
    };
  },
  computed: {
    isEmail() {
      return this.type === 'email';
    },
    isText() {
      return this.type === 'text';
    },
    isTextarea() {
      return this.type === 'textarea';
    },
    isRoute() {
      return this.type === 'route' && this.routeTo !== null;
    },
    isDate() {
      return this.type === 'date';
    },
    isSelection() {
      return this.type === 'selection';
    },
    valueToDate() {
      const newDate = this.isDate ? new Date(this.value) : null;
      return newDate;
    },
  },
  mounted () {
    this.id = this._uid;
  },
  methods: {
    cancelEdit() {
      this.editField = false;
    },
    btnClickEdit() {
      this.localField = this.value;
      this.editField = true;
    },
    btnClickSubmit() {
      let resultObj;
      if (this.isEmail) {
        const value = formatEmail(this.localField);
        this.localField = value;
      }
      if (this.index != undefined && this.extension) {
        resultObj = { 
          field: this.field,
          index: this.index,
          extension: this.extension,
          change: this.localField,
        };
      } else {
        resultObj = { [this.field]: this.localField };
      }

      this.$emit('changeField', resultObj);
      this.editField = false;
    },
  },
};
</script>

<style scoped>
  .non-editable {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .edit-field {
    width: 100%;
  }

  .non-editable .change-link {
    margin-left: auto;
  }

  .wrap {
    overflow-wrap: anywhere;
  }
</style>
