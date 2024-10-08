<script setup>
definePageMeta({
  title: "User",
});

const showModal = ref(false);

const field = [
  "Id",
  "Name",
  "IC",
  "Address",
  "Birthday",
  "Gender",
  "Type",
  "Action",
];
const data = [
  {
    id: 1,
    fullName: "Osman",
    IC: 25,
    address: "Blok B, Jalan Budiman",
    birthday: "22-02-1999",
    gender: "Male",
    type: "Public",
  },
  {
    id: 2,
    fullName: "Osman",
    IC: 25,
    address: "Blok B, Jalan Budiman",
    birthday: "22-02-1999",
    gender: "Male",
    type: "Public",
  },
  {
    id: 3,
    fullName: "Osman",
    IC: 25,
    address: "Blok B, Jalan Budiman",
    birthday: "22-02-1999",
    gender: "Male",
    type: "Public",
  },
  {
    id: 4,
    fullName: "Osman",
    IC: 25,
    address: "Blok B, Jalan Budiman",
    birthday: "22-02-1999",
    gender: "Male",
    type: "Public",
  },
  {
    id: 5,
    fullName: "Osman",
    IC: 25,
    address: "Blok B, Jalan Budiman",
    birthday: "22-02-1999",
    gender: "Male",
    type: "Public",
  },
];
</script>
<template>
  <div>
    <rs-card>
      <template #header>
        <h6>User</h6>
      </template>
      <template #body>
        <div class="flex justify-end mb-4">
          <rs-button
            variant="success"
            class="flex items-center space-x-2"
            @click="navigateTo('/AddUser')"
          >
            <Icon name="mdi:account-plus"></Icon>
            <span>Add New</span>
          </rs-button>
        </div>
        <rs-table
          :field="field"
          :data="data"
          :options="{
            variant: 'default',
            striped: true,
            borderless: true,
            hover: true,
            fixed: false,
          }"
          basic
        >
          <template v-slot:Action="data">
            <div class="flex space-x-2">
              <rs-button variant="success">
                <Icon name="mdi:pencil" @click="navigateTo('/EditUser')"></Icon>
              </rs-button>
              <rs-button variant="danger" @click="showModal = true">
                <Icon name="mdi:delete"></Icon>
              </rs-button>
            </div>
          </template>
        </rs-table>
      </template>
    </rs-card>

    <rs-modal title="Delete User" v-model="showModal">
      Are you sure you want to delete this user?
    </rs-modal>
  </div>
</template>
