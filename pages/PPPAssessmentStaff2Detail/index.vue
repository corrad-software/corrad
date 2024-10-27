<template>
  <div class="container mx-auto p-4">
    <!-- Staff Information Section -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <p><strong>Staff ID</strong>: 5894</p>
        <p><strong>Staff Name</strong>: Hapini bin Awang</p>
        <p><strong>Email</strong>: <a href="mailto:hapini.awang@uum.edu.my" class="text-blue-600">hapini.awang@uum.edu.my</a></p>
        <p><strong>Designation</strong>: Pensyarah Universiti (DS51)</p>
        <p><strong>Department</strong>: Pengkomputeran</p>
        <p><strong>Session</strong>: 2024 Staff Job Performance Review</p>
      </div>
      <div>
        <p><strong>Status</strong>: <span class="text-green-600 font-bold">Active</span></p>
        <p><strong>Supervisor</strong></p>
        <p><strong>PPP</strong></p>
        <p><strong>PPK</strong></p>
        <p><strong>Peer Approver</strong></p>
      </div>
      <img src="https://via.placeholder.com/100" alt="Staff Photo" class="rounded-full w-24 h-24 border border-gray-300">
    </div>

    <!-- Assignment Summary Section -->
    <div class="border border-gray-300 rounded-md mb-4">
      <h3 class="bg-gray-200 p-2 font-semibold">1. Assignment Summary</h3>
      <div class="p-4">
        <p><strong>Job Purpose (Tujuan Perwujudan Jawatan)</strong>: test1</p>
      </div>
    </div>

    <!-- Assignment Detail Section -->
    <div class="border border-gray-300 rounded-md mb-4">
      <h3 class="bg-gray-200 p-2 font-semibold">2. Assignment Detail <span class="text-sm">Self Score: <strong>66.67%</strong>, PPP Score: <strong>100.00%</strong>, PPK Score:</span></h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-blue-300 text-white">
            <th class="border border-gray-300 p-2">No</th>
            <th class="border border-gray-300 p-2">Accountability</th>
            <th class="border border-gray-300 p-2">Main Task</th>
            <th class="border border-gray-300 p-2">Target</th>
            <th class="border border-gray-300 p-2">Achievement</th>
            <th class="border border-gray-300 p-2">Assessment</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 p-2">1</td>
            <td class="border border-gray-300 p-2">tset</td>
            <td class="border border-gray-300 p-2">1. tset</td>
            <td class="border border-gray-300 p-2">tset</td>
            <td class="border border-gray-300 p-2">achieved 1</td>
            <td class="border border-gray-300 p-2">
              <p>Self Assessment: <strong>10 / 10</strong></p>
              <label>PPP Assessment:</label>
              <select class="border rounded p-1">
                <option>10</option>
                <option>9</option>
                <option>8</option>
              </select>
              <div class="flex items-center gap-2 mt-1">
                <input type="radio" id="accept1" name="assessment1" class="mr-1" />
                <label for="accept1" class="text-green-600">Accept</label>
                <input type="radio" id="reject1" name="assessment1" class="mr-1" />
                <label for="reject1" class="text-red-600">Reject</label>
              </div>
              <textarea class="border rounded w-full mt-2 p-1" rows="2" placeholder="Enter assessment remark"></textarea>
            </td>
          </tr>
          <!-- Repeat similar structure for additional tasks -->
        </tbody>
      </table>
    </div>

    <!-- Dimension Section -->
    <div class="border border-gray-300 rounded-md mb-4">
      <h3 class="bg-gray-200 p-2 font-semibold">3. Dimension</h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-blue-300 text-white">
            <th class="border border-gray-300 p-2">No.</th>
            <th class="border border-gray-300 p-2">Parameter</th>
            <th class="border border-gray-300 p-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 p-2">1</td>
            <td class="border border-gray-300 p-2">tset</td>
            <td class="border border-gray-300 p-2">test</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Academic/Professional Qualification Section -->
    <div class="border border-gray-300 rounded-md mb-4">
      <h3 class="bg-gray-200 p-2 font-semibold">4. Academic/Professional Qualification</h3>
      <div class="p-4">
        <p>tset</p>
      </div>
    </div>

    <!-- Work Experience Section -->
    <div class="border border-gray-300 rounded-md mb-6">
      <h3 class="bg-gray-200 p-2 font-semibold">5. Work Experience</h3>
      <div class="p-4">
        <p>tset testtt</p>
        <p><strong>Self Summary</strong>: PYD assessed</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4">
      <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Update</button>
      <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Confirm</button>
      <button class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Back</button>
    </div>
  </div>
</template>

<script setup>
// This page uses static dummy data for illustration.
// You can replace this with actual data from an API or props if needed.
</script>

<style scoped>
.container {
  max-width: 1200px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}

.bg-blue-200 {
  background-color: #b3c7ff;
}
</style>
