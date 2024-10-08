<script setup>
definePageMeta({
  title: "Application",
});

const genders = ["Male", "Female"];
const types = ["Government", "Public"];
</script>
<template>
 
  <div>
    <rs-card>
      <template #header>
        <h6>Application</h6>
      </template>
      <template #body>
        <FormKit type="text" label="Name" placeholder="Name" />
        <FormKit type="number" label="IC Number" value="" step="1" />
        <FormKit
          type="textarea"
          placeholder="Address"
          rows="8"
          label="Address"
        />
        <FormKit type="date" :value="date" label="Birthday" />
        <FormKit type="radio" label="Gender" :options="genders" />
        <FormKit type="select" label="Customer Type" :options="types" />
      </template>
      <template #footer>
        <rs-button variant="success" class="w-full" @click="navigateTo('/Listing')">Add Application</rs-button></template
      >
    </rs-card>
  </div>
</template>
