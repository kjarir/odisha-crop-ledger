# Group System Setup Instructions

## ✅ **What I've Updated:**

### **1. Batch Registration (`BatchRegistration.tsx`)**
- ✅ Now uses `groupCertificateGenerator.generateHarvestCertificate()`
- ✅ Creates a Pinata group for each batch
- ✅ Stores the Group ID in the database
- ✅ Shows Group ID in success message

### **2. Purchase System (`SimplePurchaseModal.tsx`)**
- ✅ Now uses `groupCertificateGenerator.generatePurchaseCertificate()`
- ✅ Adds purchase certificates to the existing group
- ✅ No more complex transaction tracking

### **3. Database Schema**
- ✅ Added `group_id` column to batches table

## 🚀 **What You Need to Do:**

### **Step 1: Add Group ID Column to Database**
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run this SQL:
```sql
ALTER TABLE batches ADD COLUMN IF NOT EXISTS group_id VARCHAR(255);
```

### **Step 2: Test the System**
1. Register a new batch
2. Check your Pinata dashboard - you should see a new group created
3. Make a purchase
4. Check the group - you should see a new certificate added

### **Step 3: Verify the Group System**
1. Go to your Pinata dashboard
2. Click on "Groups" in the sidebar
3. You should see your batch groups
4. Click on a group to see all certificates

## 🎯 **Expected Results:**

### **After Batch Registration:**
- ✅ Group created in Pinata
- ✅ Harvest certificate uploaded to group
- ✅ Group ID stored in database
- ✅ Success message shows Group ID

### **After Purchase:**
- ✅ Purchase certificate added to same group
- ✅ Complete transaction history in one place
- ✅ Easy verification with Group ID

## 🔍 **How to Verify:**

### **In Pinata Dashboard:**
1. Go to "Groups" section
2. Find your batch group
3. Click on it to see all certificates
4. Download any certificate

### **In Your App:**
1. The Group ID will be shown after batch registration
2. Use this Group ID for verification
3. All certificates will be in the same group

## 🎉 **Benefits:**

- ✅ **Simple** - No complex database queries
- ✅ **Transparent** - All certificates in one group
- ✅ **Immutable** - Each certificate is immutable
- ✅ **Easy Verification** - Just need Group ID
- ✅ **Scalable** - Works with any number of transactions

The system is now updated to use Pinata groups! Try registering a new batch and you should see the group created in your Pinata dashboard. 🚀
