from django.utils import timezone

from rest_framework import serializers
from django.db.models import Sum

from tests_app.models import TestAllocations, TestsDetails, UserTests


class TestDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = TestsDetails
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},
            'wightage': {'required': True},
            'question_details': {'required': True},
        }

    def validate_total_questions(self, total_questions):
        try:
            total_questions = int(total_questions)
            if total_questions <= 0:
                raise
            return total_questions
        except:
            raise serializers.ValidationError('A valid positive integer is required.')

    def validate_question_details(self, question_details):
        valid_question_types = ["easy_mcq_count", "medium_mcq_count", "hard_mcq_count", 'easy_program_count', 'medium_program_count', 'hard_program_count']
        required_keys = ['language'] + valid_question_types

        if not question_details or not isinstance(question_details, list):
            raise serializers.ValidationError("A non-empty list of objects is required. E.g. [{'language': 'python', 'easy_mcq_count': '2', 'medium_mcq_count': '2', 'hard_mcq_count': '2', 'easy_program_count': '1', 'medium_program_count': '1', 'hard_program_count': '1'}]")

        for details in question_details:
            if not isinstance(details, dict):
                raise serializers.ValidationError("A non-empty object value is required. E.g. {'language': 'python', 'easy_mcq_count': '2', 'medium_mcq_count': '2', 'hard_mcq_count': '2', 'easy_program_count': '1', 'medium_program_count': '1', 'hard_program_count': '1'}")
            if not all(key in details for key in required_keys):
                raise serializers.ValidationError(', '.join(required_keys) + ' are required keys for object value.')
            try:
                for question_type in valid_question_types:
                    details[question_type] = int(details[question_type])
                    if details[question_type] < 0:
                        raise
            except:
                raise serializers.ValidationError('A valid positive integer is required for question counts.')

        return question_details

    def create(self, validated_data):
        return TestsDetails.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        TestsDetails.objects.filter(id=instance.pk).update(**validated_data)
        return instance


class TestAllocationsSerialiazer(serializers.ModelSerializer):
    start_date = serializers.DateTimeField(default=serializers.CreateOnlyDefault(timezone.now))
    test_details = serializers.SerializerMethodField()
    email_count = serializers.SerializerMethodField()
    avg_result = serializers.SerializerMethodField()

    class Meta:
        model = TestAllocations
        fields = ('name', 'key', 'start_date', 'end_date', 'test', 'test_details', 'email_list', 'email_count', 'avg_result', 'created_by', 'updated_by', 'created_at', 'updated_at')
        read_only_fields = ['test_details']
        extra_kwargs = {
            'name': {'required': True},
            'start_date': {'required': False},
            'end_date': {'required': True},
            'test': {'required': True}
        }

    def get_test_details(self, obj):
        return TestDetailSerializer(obj.test).data

    def get_email_count(self, obj):
        assignee_list = []
        if obj and obj.email_list:
            assignee_list = obj.email_list.split(",")
        return len(assignee_list)
    
    def get_avg_result(self, obj):
        avg_result = 0
        attempted_test = UserTests.objects.filter(test_allocation=obj.id)
        if attempted_test:
            avg_result = round(attempted_test.aggregate(Sum('score'))["score__sum"] / len(attempted_test), 2)
        return avg_result

    def validate_test(self, test):
        return TestsDetails.objects.get(id=test.id)

    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError('End date must be in future.')
        test_end_date = data['test'].end_date
        if test_end_date and data['end_date'] and data['end_date'] >= test_end_date :
            raise serializers.ValidationError("End date can not be greater then orignal test's end date.")
        data['email_list'] = (",").join([email.strip() for email in data['email_list'].split(",")])
        return super().validate(data)

    def create(self, validated_data):
        return TestAllocations.objects.create(**validated_data)


class UserTestsSerialiazer(serializers.ModelSerializer):
    test_allocation_detail = TestAllocationsSerialiazer(source='testallocations', read_only=True)

    class Meta:
        model = UserTests
        fields = ('id', 'first_name', 'last_name', 'email', 'test_allocation', 'test_allocation_detail', 'correct_answers', 'completed', 'score', 'generated_question')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'test_allocation': {'required': True},
        }

    def validate_test_allocation(self, test_allocation):
        return TestAllocations.objects.get(id=test_allocation.id)

    def create(self, validated_data):
        return UserTests.objects.create(**validated_data)

    def update(self, instance, validated_data):
        UserTests.objects.filter(id=instance.pk).update(**validated_data)
        return instance


class SingleUserTestsSerialiazer(serializers.ModelSerializer):
    test_allocation_detail = TestAllocationsSerialiazer(source='testallocations', read_only=True)
    name = serializers.SerializerMethodField()
    test_name = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()
    class Meta:
        model = UserTests
        fields = ('id', 'first_name','name', 'last_name', 'email', 'test_allocation', 'test_allocation_detail', 'test_name', 'end_date', 'correct_answers', 'completed', 'score', 'generated_question')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'test_allocation': {'required': True},
        }

    def validate_test_allocation(self, test_allocation):
        return TestAllocations.objects.get(id=test_allocation.id)

    def get_test_name(self, record):
        return record.test_allocation.name

    def get_name(self, record):
        return record.first_name+" "+record.last_name
    
    def get_end_date(self, record):
        return record.test_allocation.end_date

class TestSummarySerialiazer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = UserTests
        fields = ('name','email', 'correct_answers', 'completed', 'score')

    def get_name(self, record):
        return record.test_allocation.name