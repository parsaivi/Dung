# Generated by Django 4.2.7 on 2025-06-02 09:10

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('expenses', '0003_friendrequest'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='expenseshare',
            unique_together=set(),
        ),
        migrations.AddField(
            model_name='expense',
            name='icon',
            field=models.CharField(blank=True, default='default-icon', max_length=50),
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bio', models.TextField(blank=True)),
                ('profile_picture', models.ImageField(blank=True, null=True, upload_to='profile_pictures/')),
                ('telegram_username', models.CharField(blank=True, max_length=100, null=True)),
                ('telegram_notification', models.BooleanField(default=False)),
                ('email_notification', models.BooleanField(default=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
