const express = require('express');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
    let connection;
    try {
        connection = await req.db.getConnection();
        const userId = req.query.userId;
        const isUser = ['true', '1'].includes(String(req.query.isUser).toLowerCase());
        const companyId = req.query.companyId;

        // 1. Vídeos em Andamento
        let videosInProgressQuery = `
            SELECT COUNT(*) AS "videosInProgress" 
            FROM videos 
            WHERE status NOT IN ('Pendente', 'Cancelado', 'Publicado')
            ${isUser ? 'AND company_id = ?' : 'AND (script_writer_id = ? OR editor_id = ? OR thumb_maker_id = ? OR narrator_id = ?) AND company_id = ?'}
        `;

        // 2. Vídeos Concluídos
        let videosCompletedQuery = `
            SELECT COUNT(*) AS "videosCompleted" 
            FROM videos 
            WHERE status = 'Publicado'
            ${isUser ? 'AND company_id = ?' : 'AND (script_writer_id = ? OR editor_id = ? OR thumb_maker_id = ? OR narrator_id = ?) AND company_id = ?'}
        `;

        // 3. Freelancers Ativos
        const activeFreelancersQuery = `
            SELECT COUNT(DISTINCT id) AS "activeFreelancers" 
            FROM users 
            WHERE role IN ('roteirista', 'editor', 'narrador')
            AND company_id = ?
        `;

        // 4. Canais Gerenciados
        const managedChannelsQuery = `
            SELECT COUNT(*) AS "managedChannels" 
            FROM channels 
            WHERE company_id = ?
        `;

        // 5. Atividades Recentes (Corrigido)
        let recentActivitiesQuery = `
            SELECT 
                vl.id, 
                CASE 
                    WHEN vl.is_user THEN u.name 
                    ELSE f.name 
                END AS "user", 
                vl.action, 
                v.title AS "content", 
                vl.from_status AS "fromStatus",  
                vl.to_status AS "toStatus",      
                TIMESTAMPDIFF(MINUTE, vl.created_at, NOW()) AS "minutesAgo"
            FROM video_logs vl
            LEFT JOIN users u ON vl.user_id = u.id AND vl.is_user = true
            LEFT JOIN freelancers f ON vl.freelancer_id = f.id AND vl.is_user = false
            JOIN videos v ON vl.video_id = v.id
            WHERE v.company_id = ?
        `;

        // Aplicar filtro adicional apenas para não usuários (freelancers)
        if (!isUser) {
            recentActivitiesQuery += `
                AND v.id IN (
                    SELECT id 
                    FROM videos 
                    WHERE script_writer_id = ?
                    OR editor_id = ?
                    OR thumb_maker_id = ?
                    OR narrator_id = ?
                )`;
        }

        recentActivitiesQuery += ' ORDER BY vl.created_at DESC';

        // Parâmetros das queries
        const videosInProgressParams = isUser
            ? [companyId]
            : [userId, userId, userId, userId, companyId];
        const videosCompletedParams = isUser
            ? [companyId]
            : [userId, userId, userId, userId, companyId];
        const activeFreelancersParams = [companyId];
        const managedChannelsParams = [companyId];
        const recentActivitiesParams = isUser
            ? [companyId]
            : [companyId, userId, userId, userId, userId];

        // Executar todas as queries simultaneamente
        const [
            videosInProgressResult,
            videosCompletedResult,
            activeFreelancersResult,
            managedChannelsResult,
            recentActivitiesResult
        ] = await Promise.all([
            connection.query(videosInProgressQuery, videosInProgressParams),
            connection.query(videosCompletedQuery, videosCompletedParams),
            connection.query(activeFreelancersQuery, activeFreelancersParams),
            connection.query(managedChannelsQuery, managedChannelsParams),
            connection.query(recentActivitiesQuery, recentActivitiesParams)
        ]);

        // Processar resultados
        const stats = {
            videosInProgress: parseInt(videosInProgressResult[0][0].videosInProgress),
            videosCompleted: parseInt(videosCompletedResult[0][0].videosCompleted),
            activeFreelancers: parseInt(activeFreelancersResult[0][0].activeFreelancers),
            managedChannels: parseInt(managedChannelsResult[0][0].managedChannels)
        };

        const formattedActivities = recentActivitiesResult[0].map(activity => {
            const toStatus = (activity.toStatus || '').replace(/_/g, ' ');
            const fromStatus = (activity.fromStatus || '').replace(/_/g, ' ');
            let message;

            if (toStatus.includes('Em Andamento')) {
                message = `${activity.user} iniciou "${toStatus}" no vídeo "${activity.content}".`;
            } else if (toStatus.includes('Concluído')) {
                message = `${activity.user} concluiu "${toStatus}" no vídeo "${activity.content}".`;
            } else if (toStatus) {
                message = `${activity.user} alterou o status para "${toStatus}" no vídeo "${activity.content}".`;
            } else {
                message = `${activity.user} realizou a ação "${activity.action}" no vídeo "${activity.content}".`;
            }

            const minutesAgo = Math.floor(activity.minutesAgo);
            const timeAgo = minutesAgo < 60 
                ? `${minutesAgo} min atrás` 
                : `${Math.floor(minutesAgo / 60)}h atrás`;

            return { id: activity.id, message, time: timeAgo };
        });

        res.json({
            stats,
            recentActivities: formattedActivities
        });

    } catch (error) {
        console.error('Erro no dashboard:', error);
        res.status(500).json({
            message: 'Erro interno no servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router
