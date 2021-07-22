<template>
  <div
    v-if="modalOpen"
    class="modal-mask"
  >
    <div class="modal">
      <div class="container">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  data(){
    return {
      modalOpen: false,
    };
  },
  methods: {
    closeModal() {
      this.modalOpen = false;
      document.body.style.overflow = '';
    },
    openModal() {
      this.modalOpen = true;
      document.body.style.overflow = 'hidden';
    },
  },
};
</script>

<style lang="scss">
  @mixin mobile-view {
    @media (max-width: 599px) { @content; }
  }

  @include mobile-view { 
    .modal {
      min-width: 100% !important;
      min-height: 100% !important;
    }
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    min-width: 30%;
    transform: translate(-50%, -50%);
    border: solid 2px #b1b4b6;
    background-color: #ffffff;
  }
  .modal__title {
    text-align: center;
    vertical-align: middle;
    border: solid 2px #1d70b8;
    background-color: #1d70b8;
    color: white;
  }
  .modal__message {
    vertical-align: middle;
  }
  .deny {
    background-color: #f3f2f1;
  }
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
    overflow: hidden;
  }
</style>
