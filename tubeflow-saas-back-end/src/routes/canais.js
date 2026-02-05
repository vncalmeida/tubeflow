const express = require('express');
const router = express.Router();

router.get('/channels', async (req, res) => {
    const companyId = req.headers['company-id'];
    let client;

    if (!companyId) {
        return res.status(400).json({ 
            message: 'Company ID é obrigatório.',
            errorCode: 'MISSING_COMPANY_ID'
        });
    }

    try {
        client = await req.db.getConnection();

        const channelsQuery = `
            SELECT
                c.id,
                c.name,
                c.description,
                c.youtube_url AS youtubeUrl,
                COUNT(v.id) AS totalVideos,
                SUM(CASE WHEN MONTH(v.created_at) = MONTH(CURRENT_DATE()) THEN 1 ELSE 0 END) AS monthlyVideos
            FROM channels c
            LEFT JOIN videos v ON v.channel_id = c.id
            WHERE c.company_id = ? AND c.enabled = true
            GROUP BY c.id`;

        const totalVideosQuery = `
            SELECT COUNT(*) AS totalMonthlyVideos
            FROM videos
            WHERE company_id = ?
              AND MONTH(created_at) = MONTH(CURRENT_DATE())`;

        const [channelsResult] = await client.query(channelsQuery, [companyId]);
        const [totalVideosResult] = await client.query(totalVideosQuery, [companyId]);

        res.json({
            channels: channelsResult,
            totalMonthlyVideos: totalVideosResult[0].totalMonthlyVideos,
        });
    } catch (error) {
        console.error('Erro ao buscar canais:', {
            error: error.message,
            stack: error.stack,
            companyId: companyId.slice(0, 8)
        });
        res.status(500).json({ 
            message: 'Erro ao buscar canais.',
            errorCode: 'CHANNEL_FETCH_ERROR'
        });
    } finally {
        if (client) client.release();
    }
});

router.post('/channels', async (req, res) => {
    const { name, description, youtubeUrl } = req.body;
    const companyId = req.headers['company-id'];
    let client;

    if (!companyId) {
        return res.status(400).json({ 
            message: 'Company ID é obrigatório.',
            errorCode: 'MISSING_COMPANY_ID'
        });
    }

    if (!name || !description || !youtubeUrl) {
        return res.status(400).json({ 
            message: 'Todos os campos são obrigatórios.',
            requiredFields: ['name', 'description', 'youtubeUrl'],
            errorCode: 'MISSING_REQUIRED_FIELDS'
        });
    }

    try {
        client = await req.db.getConnection();

        const insertQuery = `
            INSERT INTO channels (
                name,
                description,
                youtube_url,
                company_id,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())`;

        const [result] = await client.query(insertQuery, [
            name,
            description,
            youtubeUrl,
            companyId
        ]);

        res.json({
            id: result.insertId,
            message: 'Canal criado com sucesso.',
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao criar canal:', {
            error: error.message,
            params: { name, description, youtubeUrl: youtubeUrl.slice(0, 20) },
            companyId: companyId.slice(0, 8)
        });
        res.status(500).json({ 
            message: 'Erro ao criar canal.',
            errorCode: 'CHANNEL_CREATION_ERROR'
        });
    } finally {
        if (client) client.release();
    }
});

router.put('/channels/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, youtubeUrl } = req.body;
    const companyId = req.headers['company-id'];
    let client;

    if (!companyId) {
        return res.status(400).json({ 
            message: 'Company ID é obrigatório.',
            errorCode: 'MISSING_COMPANY_ID'
        });
    }

    if (!name || !description || !youtubeUrl) {
        return res.status(400).json({ 
            message: 'Todos os campos são obrigatórios.',
            requiredFields: ['name', 'description', 'youtubeUrl'],
            errorCode: 'MISSING_REQUIRED_FIELDS'
        });
    }

    try {
        client = await req.db.getConnection();

        const updateQuery = `
            UPDATE channels
            SET
                name = ?,
                description = ?,
                youtube_url = ?,
                updated_at = NOW()
            WHERE id = ? AND company_id = ?`;

        const [result] = await client.query(updateQuery, [
            name,
            description,
            youtubeUrl,
            id,
            companyId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Canal não encontrado ou não pertence à empresa.',
                errorCode: 'CHANNEL_NOT_FOUND'
            });
        }

        res.json({
            message: 'Canal atualizado com sucesso.',
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao atualizar canal:', {
            error: error.message,
            channelId: id,
            companyId: companyId.slice(0, 8)
        });
        res.status(500).json({ 
            message: 'Erro ao atualizar canal.',
            errorCode: 'CHANNEL_UPDATE_ERROR'
        });
    } finally {
        if (client) client.release();
    }
});

router.delete('/channels/:id', async (req, res) => {
    const { id } = req.params;
    const companyId = req.headers['company-id'];
    let client;

    if (!companyId) {
        return res.status(400).json({ 
            message: 'Company ID é obrigatório.',
            errorCode: 'MISSING_COMPANY_ID'
        });
    }

    try {
        client = await req.db.getConnection();
        await client.beginTransaction();

        // Excluir logs de vídeos não publicados
        await client.query(`
            DELETE FROM video_logs
            WHERE video_id IN (
                SELECT id FROM videos
                WHERE channel_id = $1
                AND company_id = $2
                AND status != 'Publicado'
            )
        `, [id, companyId]);

        // Excluir vídeos não publicados
        await client.query(`
            DELETE FROM videos
            WHERE channel_id = $1
            AND company_id = $2
            AND status != 'Publicado'
        `, [id, companyId]);

        // Desabilitar canal
        const [updateResult] = await client.query(
            `UPDATE channels
            SET enabled = false
            WHERE id = ? AND company_id = ?`,
            [id, companyId]
        );

        if (updateResult.affectedRows === 0) {
            await client.rollback();
            return res.status(404).json({
                message: 'Canal não encontrado ou não pertence à empresa.',
                errorCode: 'CHANNEL_NOT_FOUND'
            });
        }

        await client.commit();
        res.json({
            message: 'Canal desabilitado com sucesso.',
            disabledAt: new Date().toISOString()
        });
    } catch (error) {
        await client.rollback();
        console.error('Erro ao desabilitar canal:', {
            error: error.message,
            channelId: id,
            companyId: companyId.slice(0, 8)
        });
        res.status(500).json({ 
            message: 'Erro ao desabilitar canal.',
            errorCode: 'CHANNEL_DELETION_ERROR'
        });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
