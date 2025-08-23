import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function pruneDuplicates() {
  console.log('Starting duplicate address pruning...');

  try {
    // Get all addresses grouped by address and season
    const allAddresses = await prisma.address.findMany({
      select: {
        id: true,
        address: true,
        season: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by address and season to find duplicates
    const groupedAddresses = new Map<string, any[]>();
    
    allAddresses.forEach(addr => {
      const key = `${addr.address.toLowerCase()}-${addr.season}`;
      if (!groupedAddresses.has(key)) {
        groupedAddresses.set(key, []);
      }
      groupedAddresses.get(key)!.push(addr);
    });

    // Find groups with duplicates
    const duplicates = Array.from(groupedAddresses.entries())
      .filter(([key, addresses]) => addresses.length > 1)
      .map(([key, addresses]) => {
        const [address, season] = key.split('-');
        return {
          address,
          season: parseInt(season),
          count: addresses.length,
          records: addresses
        };
      });

    console.log(`Found ${duplicates.length} address/season combinations with duplicates`);

    let totalRemoved = 0;

    for (const duplicate of duplicates) {
      const { address, season, count, records } = duplicate;

      console.log(`Processing ${address} (season ${season}) - ${count} duplicates`);

      // Keep the most recent record (first in the array since we ordered by createdAt desc)
      const recordsToDelete = records.slice(1);

      if (recordsToDelete.length > 0) {
        const deleteResult = await prisma.address.deleteMany({
          where: {
            id: {
              in: recordsToDelete.map(record => record.id)
            }
          }
        });

        totalRemoved += deleteResult.count;
        console.log(`  Removed ${deleteResult.count} duplicate records for ${address} (season ${season})`);
      }
    }

    console.log(`\nPruning complete! Total records removed: ${totalRemoved}`);

    // Verify no duplicates remain
    const remainingAddresses = await prisma.address.findMany({
      select: {
        id: true,
        address: true,
        season: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const remainingGrouped = new Map<string, any[]>();
    
    remainingAddresses.forEach(addr => {
      const key = `${addr.address.toLowerCase()}-${addr.season}`;
      if (!remainingGrouped.has(key)) {
        remainingGrouped.set(key, []);
      }
      remainingGrouped.get(key)!.push(addr);
    });

    const remainingDuplicates = Array.from(remainingGrouped.entries())
      .filter(([key, addresses]) => addresses.length > 1);

    if (remainingDuplicates.length === 0) {
      console.log('✅ No duplicates remain in the database');
    } else {
      console.log(`⚠️  ${remainingDuplicates.length} address/season combinations still have duplicates`);
    }

  } catch (error) {
    console.error('Error pruning duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

pruneDuplicates()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
