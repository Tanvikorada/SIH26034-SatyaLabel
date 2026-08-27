import re

with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    routes = f.read()

# Add a canceled flag to the scan model or just check if status is 'canceled'
cancel_route = '''
// POST /api/v1/scans/:id/cancel
router.post('/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const scan = await Scan.findByPk(req.params.id);
    if (!scan) return fail(res, 404, 'SCAN_NOT_FOUND', 'Scan not found');
    
    if (scan.status === 'processing') {
      await scan.update({ status: 'failed', errorMessage: 'Scan cancelled by user.' });
      return ok(res, { message: 'Scan cancelled successfully' });
    }
    
    return ok(res, { message: 'Scan already finished' });
  } catch (err) {
    return fail(res, 500, 'INTERNAL_ERROR', err.message);
  }
});
'''

# Insert it before module.exports
routes = routes.replace('module.exports = router;', cancel_route + '\nmodule.exports = router;')

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(routes)
